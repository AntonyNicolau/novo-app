"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRole, setRole, type UserRole } from "@/lib/fuelwise";
import {
  Fuel,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Truck,
  ListChecks,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["manager"] },
  { href: "/veiculos", label: "Veículos", icon: Truck, roles: ["manager"] },
  { href: "/abastecimentos", label: "Abastecimentos", icon: ListChecks, roles: ["manager", "driver"] },
  { href: "/abastecimento", label: "Registrar", icon: PlusCircle, roles: ["manager", "driver"] },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut, isConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRoleState] = useState<UserRole>("manager");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRoleState(getRole());
    setReady(true);
  }, []);

  // Em modo demo (sem Supabase) o acesso é liberado; com Supabase, exige login.
  useEffect(() => {
    if (!loading && isConfigured && !user) {
      router.push("/login");
    }
  }, [loading, isConfigured, user, router]);

  const handleRoleChange = (next: UserRole) => {
    setRole(next);
    setRoleState(next);
    if (next === "driver") router.push("/abastecimento");
    else router.push("/dashboard");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      /* modo demo: ignora */
    }
    toast.success("Sessão encerrada");
    router.push("/");
  };

  if (loading || !ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-emerald-600" />
      </div>
    );
  }

  const items = NAV.filter((i) => i.roles.includes(role));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={role === "driver" ? "/abastecimento" : "/dashboard"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">FuelWise</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", active && "font-semibold")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Alternador de papel (gestor/motorista) — facilita a demonstração do MVP */}
            <div className="hidden items-center rounded-md border p-0.5 text-xs sm:flex">
              <button
                onClick={() => handleRoleChange("manager")}
                className={cn(
                  "rounded px-2 py-1 transition",
                  role === "manager" ? "bg-emerald-600 text-white" : "text-muted-foreground"
                )}
              >
                Gestor
              </button>
              <button
                onClick={() => handleRoleChange("driver")}
                className={cn(
                  "rounded px-2 py-1 transition",
                  role === "driver" ? "bg-emerald-600 text-white" : "text-muted-foreground"
                )}
              >
                Motorista
              </button>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navegação mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t px-2 py-1 md:hidden">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="shrink-0">
                <Button variant={active ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
