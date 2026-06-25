"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone, RefreshCw, CheckCircle2, Loader2, QrCode } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";
import type { WhatsappSession } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import Avatar from "@/components/Avatar";
import { SessionBadge } from "@/components/StatusBadge";

type Seller = { id: string; name: string; photo_url: string | null };

export default function ConectarPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [sessions, setSessions] = useState<Record<string, WhatsappSession>>({});

  async function load() {
    const [se, ss] = await Promise.all([
      supabase.from("sellers").select("id,name,photo_url").eq("active", true).order("name"),
      supabase.from("whatsapp_sessions").select("*"),
    ]);
    if (se.data) setSellers(se.data as Seller[]);
    if (ss.data) {
      const map: Record<string, WhatsappSession> = {};
      (ss.data as WhatsappSession[]).forEach((s) => (map[s.seller_id] = s));
      setSessions(map);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useRealtime(["whatsapp_sessions", "sellers"], load);

  // Solicita conexão: marca a sessão como 'connecting'.
  // O serviço conector (Baileys) detecta e publica o QR Code de volta.
  async function requestConnect(sellerId: string) {
    const existing = sessions[sellerId];
    if (existing) {
      await supabase
        .from("whatsapp_sessions")
        .update({ status: "connecting", qr_code: null, updated_at: new Date().toISOString() })
        .eq("seller_id", sellerId);
    } else {
      await supabase
        .from("whatsapp_sessions")
        .insert({ seller_id: sellerId, status: "connecting" });
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Conectar WhatsApp</h1>
          <p className="page-sub">
            Cada vendedor conecta lendo o QR Code — igual ao WhatsApp Web
          </p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 18, background: "var(--surface-2)" }}>
        <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
          <Smartphone size={20} style={{ color: "var(--brand)", marginTop: 2 }} />
          <div style={{ fontSize: 13, lineHeight: 1.6 }} className="dim">
            <strong style={{ color: "var(--text)" }}>Como conectar:</strong> abra o WhatsApp no
            celular do vendedor → <em>Aparelhos conectados</em> → <em>Conectar um aparelho</em> e
            aponte para o QR Code abaixo. A sessão fica salva e o monitoramento começa
            automaticamente. O sistema <strong>apenas observa</strong> — nunca envia mensagens.
          </div>
        </div>
      </div>

      <div className="grid cards-grid">
        {sellers.map((s) => {
          const sess = sessions[s.id];
          const status = sess?.status ?? "disconnected";
          return (
            <div key={s.id} className="card stack">
              <div className="row between">
                <div className="seller-head">
                  <Avatar src={s.photo_url} name={s.name} size="sm" online={status === "connected"} />
                  <div className="seller-name">{s.name}</div>
                </div>
                <SessionBadge status={status} />
              </div>

              <div className="qr-wrap" style={{ justifyContent: "center", minHeight: 180 }}>
                {status === "connected" && (
                  <div className="empty" style={{ padding: 24 }}>
                    <CheckCircle2 size={40} style={{ color: "var(--brand)" }} />
                    <p style={{ marginTop: 8 }}>Conectado e sincronizando</p>
                    <p className="muted" style={{ fontSize: 11 }}>
                      Últ. sinc. {timeAgo(sess?.last_sync_at ?? null)}
                    </p>
                  </div>
                )}

                {status === "qr" && sess?.qr_code && (
                  <div className="flex-col" style={{ alignItems: "center", gap: 10 }}>
                    <div className="qr-box">
                      <QRCodeSVG value={sess.qr_code} size={168} level="M" />
                    </div>
                    <span className="muted" style={{ fontSize: 11.5 }}>
                      Escaneie em até 60s
                    </span>
                  </div>
                )}

                {status === "connecting" && (
                  <div className="empty" style={{ padding: 24 }}>
                    <Loader2 size={34} className="spin" style={{ color: "var(--warning)" }} />
                    <p style={{ marginTop: 8 }}>Gerando QR Code...</p>
                  </div>
                )}

                {status === "disconnected" && (
                  <div className="empty" style={{ padding: 24 }}>
                    <QrCode size={36} style={{ color: "var(--text-mute)" }} />
                    <p style={{ marginTop: 8 }}>Sem sessão ativa</p>
                  </div>
                )}
              </div>

              <button
                className={`btn block ${status === "connected" ? "ghost" : "brand"}`}
                onClick={() => requestConnect(s.id)}
              >
                <RefreshCw size={15} />
                {status === "connected" ? "Reconectar" : "Gerar QR Code"}
              </button>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        :global(.spin) {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
