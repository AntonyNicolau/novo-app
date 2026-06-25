/**
 * WhatsApp Monitor — Conector
 * ----------------------------------------------------------------------------
 * Mantém uma sessão WhatsApp (protocolo WhatsApp Web, via Baileys) por vendedor.
 * Função: APENAS OBSERVAR. Lê o QR Code, escuta mensagens e presença e grava
 * tudo no Supabase. NUNCA envia, edita ou apaga mensagens.
 *
 * Fluxo:
 *   1) Carrega vendedores ativos do banco.
 *   2) Para cada sessão marcada como 'connecting' (pelo botão do painel),
 *      inicia uma conexão e publica o QR Code de volta no banco.
 *   3) Ao conectar, marca 'connected' e passa a registrar mensagens/métricas.
 *   4) Ao cair, marca 'disconnected' (gera alerta automático).
 * ----------------------------------------------------------------------------
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import pino from "pino";
import { createClient } from "@supabase/supabase-js";
import baileys from "@whiskeysockets/baileys";

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = baileys;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AUTH_DIR = process.env.AUTH_DIR || "./auth_sessions";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}

const log = pino({ level: "info", transport: { target: "pino-pretty" } }).child({
  mod: "connector",
});
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// sellerId -> { sock }
const sessions = new Map();

// ---------- Helpers de banco ----------
async function setStatus(sellerId, status, extra = {}) {
  const { error } = await supabase.rpc("set_session_status", {
    p_seller: sellerId,
    p_status: status,
    p_qr: extra.qr ?? null,
    p_jid: extra.jid ?? null,
    p_online: extra.online ?? null,
  });
  if (error) log.error({ sellerId, status, error: error.message }, "setStatus falhou");
}

async function recordMessage(sellerId, m) {
  const { error } = await supabase.rpc("record_wa_message", {
    p_seller: sellerId,
    p_customer_phone: m.phone,
    p_customer_name: m.name || "",
    p_direction: m.direction,
    p_body: m.body || "",
    p_wa_id: m.id || "",
    p_ts: m.ts,
  });
  if (error) log.error({ sellerId, error: error.message }, "recordMessage falhou");
}

// ---------- Extração de dados da mensagem ----------
function extractText(msg) {
  const c = msg.message;
  if (!c) return "";
  return (
    c.conversation ||
    c.extendedTextMessage?.text ||
    c.imageMessage?.caption ||
    c.videoMessage?.caption ||
    (c.imageMessage ? "[imagem]" : "") ||
    (c.videoMessage ? "[vídeo]" : "") ||
    (c.audioMessage ? "[áudio]" : "") ||
    (c.documentMessage ? "[documento]" : "") ||
    (c.stickerMessage ? "[figurinha]" : "") ||
    ""
  );
}

function phoneFromJid(jid = "") {
  return "+" + jid.split("@")[0].split(":")[0];
}

// ---------- Sessão por vendedor ----------
async function startSession(sellerId) {
  if (sessions.has(sellerId)) {
    log.info({ sellerId }, "sessão já ativa");
    return;
  }
  const dir = path.join(AUTH_DIR, sellerId);
  fs.mkdirSync(dir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    markOnlineOnConnect: false, // não altera presença do vendedor
    syncFullHistory: false,
  });
  sessions.set(sellerId, { sock });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect, qr } = u;
    if (qr) {
      log.info({ sellerId }, "QR Code gerado");
      await setStatus(sellerId, "qr", { qr });
    }
    if (connection === "open") {
      const jid = sock.user?.id;
      log.info({ sellerId, jid }, "✓ conectado");
      await setStatus(sellerId, "connected", { jid, online: true });
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      log.warn({ sellerId, code }, "conexão encerrada");
      sessions.delete(sellerId);
      await setStatus(sellerId, "disconnected", { online: false });
      if (!loggedOut) {
        // tenta reconectar usando credenciais salvas
        setTimeout(() => startSession(sellerId), 5000);
      } else {
        // sessão deslogada no celular: limpa credenciais
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  // presença do vendedor (online/offline)
  sock.ev.on("presence.update", async ({ id, presences }) => {
    const me = presences?.[sock.user?.id];
    if (me) {
      const online = me.lastKnownPresence === "available";
      await setStatus(sellerId, "connected", { online });
    }
  });

  // mensagens novas (recebidas e enviadas pelo vendedor)
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      const jid = msg.key.remoteJid || "";
      if (jid.endsWith("@g.us") || jid === "status@broadcast") continue; // ignora grupos/status
      const fromMe = !!msg.key.fromMe;
      const body = extractText(msg);
      if (!body && !msg.message) continue;
      await recordMessage(sellerId, {
        phone: phoneFromJid(jid),
        name: msg.pushName || "",
        direction: fromMe ? "out" : "in",
        body,
        id: msg.key.id,
        ts: new Date((Number(msg.messageTimestamp) || Date.now() / 1000) * 1000).toISOString(),
      });
    }
  });
}

// ---------- Orquestração ----------
async function bootstrap() {
  log.info("iniciando conector WhatsApp Monitor");

  // retoma sessões já conectadas (credenciais salvas em disco)
  if (fs.existsSync(AUTH_DIR)) {
    for (const sellerId of fs.readdirSync(AUTH_DIR)) {
      const creds = path.join(AUTH_DIR, sellerId, "creds.json");
      if (fs.existsSync(creds)) {
        log.info({ sellerId }, "retomando sessão salva");
        startSession(sellerId).catch((e) => log.error(e));
      }
    }
  }

  // inicia sessões solicitadas agora (status 'connecting')
  const { data } = await supabase
    .from("whatsapp_sessions")
    .select("seller_id")
    .eq("status", "connecting");
  (data || []).forEach((r) => startSession(r.seller_id).catch((e) => log.error(e)));

  // escuta novas solicitações de conexão feitas pelo painel
  supabase
    .channel("connect-requests")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "whatsapp_sessions" },
      (payload) => {
        const row = payload.new;
        if (row && row.status === "connecting" && !sessions.has(row.seller_id)) {
          log.info({ sellerId: row.seller_id }, "solicitação de conexão recebida");
          startSession(row.seller_id).catch((e) => log.error(e));
        }
      },
    )
    .subscribe();

  log.info("conector pronto — aguardando QR/sincronização");
}

bootstrap().catch((e) => {
  log.error(e, "falha no bootstrap");
  process.exit(1);
});

process.on("SIGINT", () => {
  log.info("encerrando...");
  process.exit(0);
});
