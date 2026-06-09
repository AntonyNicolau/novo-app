"use client";

import { AppShell } from "@/components/fuelwise/AppShell";
import { AlertsPanel } from "@/components/fuelwise/AlertsPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  detectFleetAlerts,
  formatBRL,
  formatKmL,
  formatNumber,
  listFuelEntries,
  listVehicles,
  seedDemoDataIfEmpty,
  summarizeVehicle,
  vehicleLabel,
  computeEntryMetrics,
  type FuelEntry,
  type Vehicle,
} from "@/lib/fuelwise";
import { DollarSign, Fuel, Gauge, Truck, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_COLORS = ["#059669", "#2563eb", "#d97706", "#db2777", "#7c3aed", "#0891b2"];

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      seedDemoDataIfEmpty();
      try {
        const [v, e] = await Promise.all([listVehicles(), listFuelEntries()]);
        setVehicles(v);
        setEntries(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const summaries = useMemo(
    () =>
      vehicles.map((v) =>
        summarizeVehicle(v, entries.filter((e) => e.vehicleId === v.id))
      ),
    [vehicles, entries]
  );

  const alerts = useMemo(
    () => detectFleetAlerts(vehicles, entries),
    [vehicles, entries]
  );

  const kpis = useMemo(() => {
    const totalCost = summaries.reduce((s, x) => s + x.totalCost, 0);
    const totalDistance = summaries.reduce((s, x) => s + x.totalDistance, 0);
    const totalLiters = summaries.reduce((s, x) => s + x.totalLiters, 0);
    const fleetKmL = totalLiters > 0 ? totalDistance / totalLiters : null;
    return { totalCost, totalDistance, fleetKmL };
  }, [summaries]);

  // Série de consumo (km/l) por veículo ao longo do tempo, alinhada por índice de abastecimento.
  const consumptionData = useMemo(() => {
    const perVehicle = vehicles.map((v) => {
      const metrics = computeEntryMetrics(
        entries.filter((e) => e.vehicleId === v.id)
      ).filter((m) => m.kmPerLiter !== null);
      return { vehicle: v, metrics };
    });
    const maxLen = Math.max(0, ...perVehicle.map((p) => p.metrics.length));
    const rows: Record<string, number | string>[] = [];
    for (let i = 0; i < maxLen; i++) {
      const row: Record<string, number | string> = { label: `Abast. ${i + 1}` };
      perVehicle.forEach((p) => {
        const m = p.metrics[i];
        if (m && m.kmPerLiter !== null) {
          row[p.vehicle.plate] = Number(m.kmPerLiter.toFixed(2));
        }
      });
      rows.push(row);
    }
    return rows;
  }, [vehicles, entries]);

  const costData = useMemo(
    () =>
      summaries.map((s) => ({
        name: s.vehicle.plate,
        gasto: Number(s.totalCost.toFixed(2)),
      })),
    [summaries]
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard da Frota</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do consumo de combustível em tempo real.
            </p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Truck className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">Nenhum veículo cadastrado</p>
                <p className="text-sm text-muted-foreground">
                  Cadastre veículos para começar a acompanhar o consumo.
                </p>
              </div>
              <Link href="/veiculos">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Cadastrar veículo</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard icon={Truck} label="Veículos" value={formatNumber(vehicles.length)} />
              <KpiCard icon={DollarSign} label="Gasto total" value={formatBRL(kpis.totalCost)} />
              <KpiCard icon={Gauge} label="Km rodados" value={`${formatNumber(kpis.totalDistance)} km`} />
              <KpiCard icon={Fuel} label="Consumo médio" value={formatKmL(kpis.fleetKmL)} />
            </div>

            {/* Gráficos */}
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consumo por veículo (km/L)</CardTitle>
                  <CardDescription>Evolução a cada abastecimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={consumptionData} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      {vehicles.map((v, i) => (
                        <Line
                          key={v.id}
                          type="monotone"
                          dataKey={v.plate}
                          name={vehicleLabel(v)}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={2}
                          connectNulls
                          dot={{ r: 3 }}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gasto total por veículo</CardTitle>
                  <CardDescription>Soma dos abastecimentos no período</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={costData} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip formatter={(v: number) => formatBRL(v)} />
                      <Bar dataKey="gasto" fill="#059669" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabela resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desempenho por veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Veículo</th>
                        <th className="py-2 pr-4 font-medium">Abast.</th>
                        <th className="py-2 pr-4 font-medium">Km rodados</th>
                        <th className="py-2 pr-4 font-medium">Consumo médio</th>
                        <th className="py-2 pr-4 font-medium">R$/km</th>
                        <th className="py-2 pr-4 font-medium">Gasto total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summaries.map((s) => (
                        <tr key={s.vehicle.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 font-medium">{vehicleLabel(s.vehicle)}</td>
                          <td className="py-2 pr-4">{s.entryCount}</td>
                          <td className="py-2 pr-4">{formatNumber(s.totalDistance)} km</td>
                          <td className="py-2 pr-4">{formatKmL(s.avgKmPerLiter)}</td>
                          <td className="py-2 pr-4">
                            {s.avgCostPerKm !== null ? formatBRL(s.avgCostPerKm) : "—"}
                          </td>
                          <td className="py-2 pr-4">{formatBRL(s.totalCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Alertas */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TriangleAlert className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-semibold">Alertas</h2>
                {alerts.length > 0 && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {alerts.length}
                  </span>
                )}
              </div>
              <AlertsPanel alerts={alerts} />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
