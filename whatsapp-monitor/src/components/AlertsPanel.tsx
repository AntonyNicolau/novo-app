"use client";
import {
  AlertTriangle,
  WifiOff,
  UserX,
  Clock,
  Layers,
  RefreshCcw,
  CheckCircle2,
  BellOff,
} from "lucide-react";
import type { Alert } from "@/lib/types";
import { timeAgo } from "@/lib/format";
import { supabase } from "@/lib/supabase";

const ICONS: Record<Alert["type"], typeof AlertTriangle> = {
  whatsapp_disconnected: WifiOff,
  seller_offline: UserX,
  customer_waiting: Clock,
  no_activity: BellOff,
  high_volume: Layers,
  sync_failure: RefreshCcw,
};

const COLOR: Record<Alert["severity"], string> = {
  critical: "var(--critical)",
  warning: "var(--warning)",
  info: "var(--info)",
};

export default function AlertsPanel({
  alerts,
  resolvable = true,
}: {
  alerts: Alert[];
  resolvable?: boolean;
}) {
  async function resolve(id: string) {
    await supabase
      .from("alerts")
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq("id", id);
  }

  if (alerts.length === 0) {
    return (
      <div className="empty">
        <CheckCircle2 size={30} style={{ color: "var(--brand)" }} />
        <p style={{ marginTop: 8 }}>Nenhum alerta ativo. Operação saudável.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {alerts.map((a) => {
        const Icon = ICONS[a.type] ?? AlertTriangle;
        return (
          <div key={a.id} className={`alert-item ${a.severity}`}>
            <span className="alert-ic" style={{ color: COLOR[a.severity] }}>
              <Icon size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <div className="alert-title">{a.title}</div>
              {a.message && <div className="alert-msg">{a.message}</div>}
              <div className="alert-time">{timeAgo(a.created_at)}</div>
            </div>
            {resolvable && (
              <button className="btn sm ghost" onClick={() => resolve(a.id)}>
                <CheckCircle2 size={14} /> Resolver
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
