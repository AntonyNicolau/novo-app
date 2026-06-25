"use client";
import { useEffect, useState } from "react";
import { Bell, History } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";
import type { Alert } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import AlertsPanel from "@/components/AlertsPanel";

export default function AlertasPage() {
  const [open, setOpen] = useState<Alert[]>([]);
  const [resolved, setResolved] = useState<Alert[]>([]);

  async function load() {
    const [o, r] = await Promise.all([
      supabase
        .from("alerts")
        .select("*")
        .eq("resolved", false)
        .order("created_at", { ascending: false }),
      supabase
        .from("alerts")
        .select("*")
        .eq("resolved", true)
        .order("resolved_at", { ascending: false })
        .limit(20),
    ]);
    if (o.data) setOpen(o.data as Alert[]);
    if (r.data) setResolved(r.data as Alert[]);
  }
  useEffect(() => {
    load();
  }, []);
  useRealtime(["alerts"], load);

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Alertas</h1>
          <p className="page-sub">
            Eventos operacionais detectados em tempo real
          </p>
        </div>
        <span className="live">
          <span className="dot" /> {open.length} ativo(s)
        </span>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="section-title">
          <Bell size={17} /> Alertas ativos
        </div>
        <AlertsPanel alerts={open} />
      </div>

      {resolved.length > 0 && (
        <div className="card">
          <div className="section-title">
            <History size={17} /> Histórico resolvido
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>Alerta</th>
                <th>Descrição</th>
                <th>Severidade</th>
                <th>Resolvido em</th>
              </tr>
            </thead>
            <tbody>
              {resolved.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.title}</td>
                  <td className="muted">{a.message}</td>
                  <td>
                    <span className={`badge ${a.severity}`}>{a.severity}</span>
                  </td>
                  <td className="muted">{formatDateTime(a.resolved_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
