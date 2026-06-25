"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Inbox,
  Timer,
  MessagesSquare,
  UserCheck,
  Wifi,
  WifiOff,
  Hourglass,
  Phone,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";
import type { SellerOverview, Conversation } from "@/lib/types";
import {
  formatResponseTime,
  formatDuration,
  formatDateTime,
  timeAgo,
  minutesSince,
} from "@/lib/format";
import Avatar from "@/components/Avatar";
import { OnlineBadge, SessionBadge } from "@/components/StatusBadge";

export default function SellerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [s, setS] = useState<SellerOverview | null>(null);
  const [convs, setConvs] = useState<Conversation[]>([]);

  async function load() {
    const [ov, cv] = await Promise.all([
      supabase.from("seller_overview").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("conversations")
        .select("*")
        .eq("seller_id", id)
        .order("last_message_at", { ascending: false }),
    ]);
    if (ov.data) setS(ov.data as SellerOverview);
    if (cv.data) setConvs(cv.data as Conversation[]);
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useRealtime(["whatsapp_sessions", "conversations", "seller_metrics_daily", "messages"], load);

  if (!s) {
    return <div className="skeleton" style={{ height: 180 }} />;
  }

  const indicators = [
    { icon: MessagesSquare, label: "Conversas ativas", value: s.conversations_count, color: "var(--accent)" },
    { icon: UserCheck, label: "Clientes hoje", value: s.messages_received_today > 0 ? s.conversations_count : 0, color: "var(--brand)" },
    { icon: Send, label: "Mensagens enviadas", value: s.messages_sent_today, color: "var(--brand)" },
    { icon: Inbox, label: "Mensagens recebidas", value: s.messages_received_today, color: "var(--accent)" },
    { icon: Timer, label: "Tempo médio resposta", value: formatResponseTime(s.avg_response_seconds), color: "var(--warning)" },
    { icon: Wifi, label: "Tempo online", value: formatDuration(s.online_seconds), color: "var(--brand)" },
    { icon: WifiOff, label: "Tempo offline", value: formatDuration(s.offline_seconds), color: "#94a3b8" },
    { icon: Hourglass, label: "Clientes aguardando", value: s.awaiting_count, color: "var(--warning)" },
  ];

  return (
    <>
      <Link href="/vendedores" className="btn ghost sm" style={{ marginBottom: 16 }}>
        <ArrowLeft size={15} /> Voltar
      </Link>

      {/* Cabeçalho do vendedor */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="row between wrap gap-lg">
          <div className="seller-head">
            <Avatar src={s.photo_url} name={s.name} size="lg" online={s.online} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.name}</div>
              <div className="row" style={{ gap: 8, marginTop: 6 }}>
                {s.session_status === "connected" ? (
                  <OnlineBadge online={s.online} />
                ) : (
                  <SessionBadge status={s.session_status} />
                )}
                {s.phone && (
                  <span className="muted" style={{ fontSize: 12.5 }}>
                    <Phone size={12} style={{ verticalAlign: -1 }} /> {s.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex-col" style={{ gap: 6, fontSize: 12.5 }}>
            <span className="dim">
              Conexão: <strong>{formatDateTime(s.connected_at)}</strong>
            </span>
            <span className="dim">
              Última atividade: <strong>{timeAgo(s.last_activity_at)}</strong>
            </span>
            <span className="dim">
              Última sincronização: <strong>{timeAgo(s.last_sync_at)}</strong>
            </span>
            <span className="muted">
              Expediente: {s.work_start?.slice(0, 5)}–{s.work_end?.slice(0, 5)}
            </span>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid stats-grid" style={{ marginBottom: 18 }}>
        {indicators.map((i) => {
          const Icon = i.icon;
          return (
            <div key={i.label} className="card stat">
              <div className="stat-top">
                <span className="stat-label">{i.label}</span>
                <span className="stat-icon" style={{ color: i.color }}>
                  <Icon size={18} />
                </span>
              </div>
              <div className="stat-value" style={{ fontSize: 23 }}>
                {i.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversas (somente acompanhamento) */}
      <div className="card">
        <div className="section-title">
          <MessagesSquare size={17} /> Conversas — somente acompanhamento
          <span className="muted" style={{ fontSize: 11, fontWeight: 400, marginLeft: 6 }}>
            (não é possível responder, editar ou excluir)
          </span>
        </div>
        {convs.length === 0 ? (
          <div className="empty">Nenhuma conversa registrada.</div>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Última mensagem</th>
                <th>Enviada por</th>
                <th>Horário</th>
                <th>Desde a interação</th>
              </tr>
            </thead>
            <tbody>
              {convs.map((c) => {
                const mins = minutesSince(c.last_message_at);
                const waiting = c.awaiting_reply;
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.customer_name ?? "—"}</td>
                    <td className="muted">{c.customer_phone}</td>
                    <td>
                      <div className="conv-last">{c.last_message ?? "—"}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.last_message_from === "customer" ? "info" : "online"}`}>
                        {c.last_message_from === "customer" ? "Cliente" : "Vendedor"}
                      </span>
                    </td>
                    <td className="muted">{formatDateTime(c.last_message_at)}</td>
                    <td>
                      <span className={waiting && mins > 30 ? "badge warning" : "dim"}>
                        {timeAgo(c.last_message_at)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
