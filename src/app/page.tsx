"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Bell,
  Fuel,
  Gauge,
  Smartphone,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const FEATURES = [
  {
    icon: Smartphone,
    title: "Registro pelo motorista",
    desc: "App simples: km, data, litros, valor e posto em poucos toques.",
  },
  {
    icon: BarChart3,
    title: "Dashboard do gestor",
    desc: "Consumo (km/L), custo por km e gasto total de cada veículo.",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    desc: "Consumo fora do padrão e inconsistências na nota são sinalizados.",
  },
  {
    icon: Gauge,
    title: "Cálculo automático",
    desc: "km/L e R$/km calculados a partir dos abastecimentos.",
  },
];

export default function Home() {
  const { user, loading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isConfigured && user) {
      router.push("/dashboard");
    }
  }, [user, loading, isConfigured, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FuelWise</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Acessar painel</Button>
            </Link>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          <TrendingDown className="h-4 w-4" /> Economize combustível na sua frota
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Controle de combustível simples para{" "}
          <span className="text-emerald-600">pequenas e médias frotas</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          O motorista registra cada abastecimento pelo celular. O gestor acompanha
          consumo, custos e alertas de inconsistência em tempo real.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Ver dashboard do gestor
            </Button>
          </Link>
          <Link href="/abastecimento">
            <Button size="lg" variant="outline">
              Registrar abastecimento
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="border-emerald-100">
                <CardContent className="space-y-3 py-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        FuelWise · MVP de gestão de combustível
      </footer>
    </div>
  );
}
