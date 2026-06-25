"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { MetricRow } from "@/lib/types";
import { formatResponseTime, formatDuration, formatDate } from "@/lib/format";
import { exportCSV, exportExcel, exportPDF, type Column, type Row } from "@/lib/export";

type Period = "daily" | "weekly" | "monthly";
type Seller = { id: string; name: string };

export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const [se, me] = await Promise.all([
        supabase.from("sellers").select("id,name").eq("active", true).order("name"),
        supabase
          .from("seller_metrics_daily")
          .select("*")
          .gte("date", since.toISOString().slice(0, 10)),
      ]);
      if (se.data) setSellers(se.data as Seller[]);
      if (me.data) setMetrics(me.data as MetricRow[]);
    })();
  }, []);

  const nameOf = useMemo(() => {
    const m = new Map(sellers.map((s) => [s.id, s.name]));
    return (id: string) => m.get(id) ?? "—";
  }, [sellers]);

  const today = new Date().toISOString().slice(0, 10);

  // ---- DIÁRIO: por vendedor, hoje ----
  const daily = useMemo(() => {
    return sellers.map((s) => {
      const r = metrics.find((m) => m.seller_id === s.id && m.date === today);
      return {
        seller: s.name,
        messages_sent: r?.messages_sent ?? 0,
        messages_received: r?.messages_received ?? 0,
        conversations_count: r?.conversations_count ?? 0,
        avg_response: formatResponseTime(r?.avg_response_seconds ?? 0),
        online: formatDuration(r?.online_seconds ?? 0),
        offline: formatDuration(r?.offline_seconds ?? 0),
      };
    });
  }, [sellers, metrics, today]);

  // ---- SEMANAL: soma últimos 7 dias por vendedor ----
  const weekly = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const cut = since.toISOString().slice(0, 10);
    return sellers.map((s) => {
      const rows = metrics.filter((m) => m.seller_id === s.id && m.date >= cut);
      const sent = rows.reduce((a, r) => a + r.messages_sent, 0);
      const recv = rows.reduce((a, r) => a + r.messages_received, 0);
      const conv = rows.reduce((a, r) => a + r.conversations_count, 0);
      const avg = rows.length
        ? Math.round(rows.reduce((a, r) => a + r.avg_response_seconds, 0) / rows.length)
        : 0;
      return {
        seller: s.name,
        enviadas: sent,
        recebidas: recv,
        conversas: conv,
        avg_response: formatResponseTime(avg),
      };
    });
  }, [sellers, metrics]);

  // ---- MENSAL: produtividade diária agregada (todos vendedores) ----
  const monthly = useMemo(() => {
    const byDate = new Map<string, { enviadas: number; recebidas: number }>();
    metrics.forEach((m) => {
      const cur = byDate.get(m.date) ?? { enviadas: 0, recebidas: 0 };
      cur.enviadas += m.messages_sent;
      cur.recebidas += m.messages_received;
      byDate.set(m.date, cur);
    });
    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, v]) => ({ date: formatDate(date), ...v }));
  }, [metrics]);

  // ---- export config ----
  function doExport(kind: "csv" | "excel" | "pdf") {
    let cols: Column[];
    let rows: Row[];
    let title: string;
    let file: string;
    if (period === "daily") {
      title = "Relatório Diário — " + new Date().toLocaleDateString("pt-BR");
      file = "relatorio-diario";
      cols = [
        { key: "seller", label: "Vendedor" },
        { key: "messages_sent", label: "Enviadas" },
        { key: "messages_received", label: "Recebidas" },
        { key: "conversations_count", label: "Conversas" },
        { key: "avg_response", label: "Tempo médio resp." },
        { key: "online", label: "Horas online" },
        { key: "offline", label: "Horas offline" },
      ];
      rows = daily as unknown as Row[];
    } else if (period === "weekly") {
      title = "Relatório Semanal — Comparativo entre vendedores";
      file = "relatorio-semanal";
      cols = [
        { key: "seller", label: "Vendedor" },
        { key: "enviadas", label: "Enviadas (7d)" },
        { key: "recebidas", label: "Recebidas (7d)" },
        { key: "conversas", label: "Conversas (7d)" },
        { key: "avg_response", label: "Tempo médio resp." },
      ];
      rows = weekly as unknown as Row[];
    } else {
      title = "Relatório Mensal — Produtividade (30 dias)";
      file = "relatorio-mensal";
      cols = [
        { key: "date", label: "Data" },
        { key: "enviadas", label: "Mensagens enviadas" },
        { key: "recebidas", label: "Mensagens recebidas" },
      ];
      rows = monthly as unknown as Row[];
    }
    if (kind === "csv") exportCSV(file, cols, rows);
    if (kind === "excel") exportExcel(file, cols, rows);
    if (kind === "pdf") exportPDF(title, file, cols, rows);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-sub">Produtividade e desempenho da equipe</p>
        </div>
        <div className="toolbar">
          <button className="btn sm" onClick={() => doExport("pdf")}>
            <FileText size={15} /> PDF
          </button>
          <button className="btn sm" onClick={() => doExport("excel")}>
            <FileSpreadsheet size={15} /> Excel
          </button>
          <button className="btn sm" onClick={() => doExport("csv")}>
            <FileDown size={15} /> CSV
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ marginBottom: 18 }}>
        {(
          [
            ["daily", "Diário"],
            ["weekly", "Semanal"],
            ["monthly", "Mensal"],
          ] as [Period, string][]
        ).map(([p, label]) => (
          <button
            key={p}
            className={`btn sm ${period === p ? "brand" : "ghost"}`}
            onClick={() => setPeriod(p)}
          >
            {label}
          </button>
        ))}
      </div>

      {period === "daily" && (
        <>
          <div className="card chart-card" style={{ marginBottom: 18 }}>
            <div className="section-title">Mensagens por vendedor — hoje</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243152" vertical={false} />
                <XAxis dataKey="seller" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="messages_sent" name="Enviadas" fill="#25d366" radius={[4, 4, 0, 0]} />
                <Bar dataKey="messages_received" name="Recebidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ReportTable
            head={["Vendedor", "Enviadas", "Recebidas", "Conversas", "Tempo médio", "Online", "Offline"]}
            rows={daily.map((d) => [
              d.seller,
              d.messages_sent,
              d.messages_received,
              d.conversations_count,
              d.avg_response,
              d.online,
              d.offline,
            ])}
          />
        </>
      )}

      {period === "weekly" && (
        <>
          <div className="card chart-card" style={{ marginBottom: 18 }}>
            <div className="section-title">Comparativo entre vendedores — últimos 7 dias</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243152" vertical={false} />
                <XAxis dataKey="seller" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="enviadas" name="Enviadas" fill="#25d366" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recebidas" name="Recebidas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="conversas" name="Conversas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ReportTable
            head={["Vendedor", "Enviadas (7d)", "Recebidas (7d)", "Conversas (7d)", "Tempo médio"]}
            rows={weekly.map((w) => [w.seller, w.enviadas, w.recebidas, w.conversas, w.avg_response])}
          />
        </>
      )}

      {period === "monthly" && (
        <div className="card chart-card">
          <div className="section-title">Produtividade — últimos 30 dias</div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243152" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="enviadas" name="Enviadas" stroke="#25d366" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="recebidas" name="Recebidas" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

function ReportTable({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="card">
      <table className="data">
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j} style={j === 0 ? { fontWeight: 600 } : undefined}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
