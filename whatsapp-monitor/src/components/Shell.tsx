"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileBarChart,
  Bell,
  QrCode,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRealtime } from "@/lib/useRealtime";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendedores", label: "Vendedores", icon: Users },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { href: "/alertas", label: "Alertas", icon: Bell, alertBadge: true },
  { href: "/conectar", label: "Conectar WhatsApp", icon: QrCode },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [openAlerts, setOpenAlerts] = useState(0);

  async function load() {
    const { count } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false);
    setOpenAlerts(count ?? 0);
  }
  useEffect(() => {
    load();
  }, []);
  useRealtime(["alerts"], load);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            <Activity size={20} />
          </div>
          <div>
            <div className="brand-title">WhatsMonitor</div>
            <div className="brand-sub">Monitoramento de vendedores</div>
          </div>
        </div>

        <nav className="flex-col" style={{ gap: 4 }}>
          {NAV.map((n) => {
            const active =
              n.href === "/" ? path === "/" : path.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${active ? "active" : ""}`}
              >
                <Icon size={18} />
                {n.label}
                {n.alertBadge && openAlerts > 0 && (
                  <span className="badge critical">{openAlerts}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          Sistema apenas de leitura.
          <br />
          Não envia nem altera mensagens.
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
