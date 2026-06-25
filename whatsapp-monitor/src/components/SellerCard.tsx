import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import type { SellerOverview } from "@/lib/types";
import { formatResponseTime, timeAgo } from "@/lib/format";
import Avatar from "./Avatar";
import { OnlineBadge, SessionBadge } from "./StatusBadge";

export default function SellerCard({ s }: { s: SellerOverview }) {
  return (
    <Link href={`/vendedores/${s.id}`} className="card seller-card">
      <div className="row between">
        <div className="seller-head">
          <Avatar src={s.photo_url} name={s.name} online={s.online} />
          <div>
            <div className="seller-name">{s.name}</div>
            <div className="seller-meta">
              <Clock size={11} style={{ verticalAlign: -1 }} /> {timeAgo(s.last_activity_at)}
            </div>
          </div>
        </div>
        {s.session_status === "connected" ? (
          <OnlineBadge online={s.online} />
        ) : (
          <SessionBadge status={s.session_status} />
        )}
      </div>

      <div className="metric-row">
        <div className="metric">
          <div className="metric-num">{s.conversations_count}</div>
          <div className="metric-cap">Conversas</div>
        </div>
        <div className="metric">
          <div className="metric-num" style={{ color: "var(--brand)" }}>
            {s.messages_sent_today}
          </div>
          <div className="metric-cap">Enviadas hoje</div>
        </div>
        <div className="metric">
          <div className="metric-num" style={{ color: "var(--accent)" }}>
            {s.messages_received_today}
          </div>
          <div className="metric-cap">Recebidas hoje</div>
        </div>
      </div>

      <div className="row between" style={{ fontSize: 12 }}>
        <span className="muted">
          Tempo médio resposta:{" "}
          <strong className="dim">{formatResponseTime(s.avg_response_seconds)}</strong>
        </span>
        {s.awaiting_count > 0 && (
          <span className="badge warning">{s.awaiting_count} aguardando</span>
        )}
      </div>

      <span className="btn ghost block sm" style={{ marginTop: 2 }}>
        Ver detalhes <ArrowUpRight size={15} />
      </span>
    </Link>
  );
}
