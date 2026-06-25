"use client";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";
import type { SellerOverview } from "@/lib/types";
import SellerCard from "@/components/SellerCard";

type Filter = "all" | "online" | "offline" | "alert";

export default function VendedoresPage() {
  const [sellers, setSellers] = useState<SellerOverview[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.from("seller_overview").select("*").order("name");
    if (data) setSellers(data as SellerOverview[]);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  useRealtime(["whatsapp_sessions", "seller_metrics_daily", "conversations", "sellers"], load);

  const list = useMemo(() => {
    return sellers.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (filter === "online") return s.online;
      if (filter === "offline") return !s.online;
      if (filter === "alert") return s.awaiting_count > 0 || s.session_status === "disconnected";
      return true;
    });
  }, [sellers, q, filter]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Vendedores</h1>
          <p className="page-sub">
            {sellers.filter((s) => s.online).length} online de {sellers.length} cadastrados
          </p>
        </div>
        <span className="live">
          <span className="dot" /> Atualização automática
        </span>
      </div>

      <div className="toolbar" style={{ marginBottom: 18 }}>
        <div className="row" style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 11, color: "var(--text-mute)" }} />
          <input
            className="input"
            style={{ paddingLeft: 34, minWidth: 260 }}
            placeholder="Buscar vendedor..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="row" style={{ gap: 6 }}>
          {(
            [
              ["all", "Todos"],
              ["online", "Online"],
              ["offline", "Offline"],
              ["alert", "Com alerta"],
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              className={`btn sm ${filter === f ? "brand" : "ghost"}`}
              onClick={() => setFilter(f)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid cards-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 230 }} />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="empty">Nenhum vendedor encontrado.</div>
      ) : (
        <div className="grid cards-grid">
          {list.map((s) => (
            <SellerCard key={s.id} s={s} />
          ))}
        </div>
      )}
    </>
  );
}
