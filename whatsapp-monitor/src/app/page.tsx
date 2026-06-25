"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  MessagesSquare,
  PlusCircle,
  Send,
  Inbox,
  Timer,
  Hourglass,
  WifiOff,
  Bell,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";
import type { DashboardStats, Alert, SellerOverview } from "@/lib/types";
import { formatResponseTime, timeAgo } from "@/lib/format";
import StatCard from "@/components/StatCard";
import AlertsPanel from "@/components/AlertsPanel";
import Avatar from "@/components/Avatar";
import { OnlineBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sellers, setSellers] = useState<SellerOverview[]>([]);
  const [updated, setUpdated] = useState<Date>(new Date());

  async function load() {
    const [s, a, sv] = await Promise.all([
      supabase.from("dashboard_stats").select("*").single(),
      supabase
        .from("alerts")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase.from("seller_overview").select("*").order("name"),
    ]);
    if (s.data) setStats(s.data as DashboardStats);
    if (a.data) setAlerts(a.data as Alert[]);
    if (sv.data) setSellers(sv.data as SellerOverview[]);
    setUpdated(new Date());
  }

  useEffect(() => {
    load();
  }, []);
  useRealtime(
    ["alerts", "whatsapp_sessions", "conversations", "seller_metrics_daily", "messages"],
    load,
  );

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Visão geral da operação comercial em tempo real
          </p>
        </div>
        <span className="live">
          <span className="dot" /> Ao vivo · atualizado {timeAgo(updated.toISOString())}
        </span>
      </div>

      {!stats ? (
        <SkeletonStats />
      ) : (
        <div className="grid stats-grid">
          <StatCard icon={Users} label="Vendedores cadastrados" value={stats.total_sellers} />
          <StatCard
            icon={UserCheck}
            label="Vendedores online"
            value={stats.online_sellers}
            color="var(--brand)"
            hint={`${stats.offline_sellers} offline`}
          />
          <StatCard
            icon={UserX}
            label="Vendedores offline"
            value={stats.offline_sellers}
            color="#94a3b8"
          />
          <StatCard
            icon={MessagesSquare}
            label="Conversas abertas"
            value={stats.open_conversations}
            color="var(--accent)"
          />
          <StatCard
            icon={PlusCircle}
            label="Novas conversas hoje"
            value={stats.new_conversations_today}
            color="var(--brand)"
          />
          <StatCard
            icon={Send}
            label="Mensagens enviadas"
            value={stats.messages_sent_today}
            color="var(--brand)"
            hint="hoje"
          />
          <StatCard
            icon={Inbox}
            label="Mensagens recebidas"
            value={stats.messages_received_today}
            color="var(--accent)"
            hint="hoje"
          />
          <StatCard
            icon={Timer}
            label="Tempo médio de resposta"
            value={formatResponseTime(stats.avg_response_seconds)}
            color="var(--warning)"
          />
          <StatCard
            icon={Hourglass}
            label="Clientes aguardando"
            value={stats.customers_waiting}
            color="var(--warning)"
          />
          <StatCard
            icon={WifiOff}
            label="WhatsApps desconectados"
            value={stats.whatsapp_disconnected}
            color={stats.whatsapp_disconnected > 0 ? "var(--critical)" : "var(--brand)"}
          />
          <StatCard
            icon={Bell}
            label="Alertas ativos"
            value={stats.active_alerts}
            color={stats.active_alerts > 0 ? "var(--critical)" : "var(--brand)"}
          />
        </div>
      )}

      <div className="grid mt" style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start" }}>
        <div className="card">
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="section-title" style={{ margin: 0 }}>
              <Users size={17} /> Vendedores
            </span>
            <Link href="/vendedores" className="btn ghost sm">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div className="flex-col">
            {sellers.map((s) => (
              <Link key={s.id} href={`/vendedores/${s.id}`} className="conv">
                <Avatar src={s.photo_url} name={s.name} size="sm" online={s.online} />
                <div className="conv-body">
                  <div className="conv-name">{s.name}</div>
                  <div className="conv-phone">
                    {s.messages_sent_today} enviadas · {s.messages_received_today} recebidas ·{" "}
                    {s.conversations_count} conversas
                  </div>
                </div>
                <div className="conv-side">
                  <OnlineBadge online={s.online} />
                  <span className="muted" style={{ fontSize: 11 }}>
                    {timeAgo(s.last_activity_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="row between" style={{ marginBottom: 12 }}>
            <span className="section-title" style={{ margin: 0 }}>
              <Bell size={17} /> Alertas em tempo real
            </span>
            <Link href="/alertas" className="btn ghost sm">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <AlertsPanel alerts={alerts} />
        </div>
      </div>
    </>
  );
}

function SkeletonStats() {
  return (
    <div className="grid stats-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 116 }} />
      ))}
    </div>
  );
}
