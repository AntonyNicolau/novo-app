"use client";

import { AppShell } from "@/components/fuelwise/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  computeEntryMetrics,
  deleteFuelEntry,
  formatBRL,
  formatDateTime,
  formatKmL,
  listFuelEntries,
  listVehicles,
  seedDemoDataIfEmpty,
  vehicleLabel,
  type FuelEntry,
  type Vehicle,
} from "@/lib/fuelwise";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function FuelHistoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    seedDemoDataIfEmpty();
    const [v, e] = await Promise.all([listVehicles(), listFuelEntries()]);
    setVehicles(v);
    setEntries(e);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const vehicleById = useMemo(
    () => new Map(vehicles.map((v) => [v.id, v])),
    [vehicles]
  );

  // Métricas por entrada (calculadas dentro de cada veículo).
  const metricsByEntryId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computeEntryMetrics>[number]>();
    for (const v of vehicles) {
      const m = computeEntryMetrics(entries.filter((e) => e.vehicleId === v.id));
      m.forEach((x) => map.set(x.entry.id, x));
    }
    return map;
  }, [vehicles, entries]);

  const rows = useMemo(() => {
    const filtered =
      filter === "all" ? entries : entries.filter((e) => e.vehicleId === filter);
    return [...filtered].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este abastecimento?")) return;
    try {
      await deleteFuelEntry(id);
      toast.success("Abastecimento removido.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Abastecimentos</h1>
            <p className="text-sm text-muted-foreground">
              Histórico completo de abastecimentos da frota.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os veículos</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {vehicleLabel(v)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link href="/abastecimento">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Registrar</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{rows.length} registro(s)</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : rows.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum abastecimento registrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 pr-4 font-medium">Data</th>
                      <th className="py-2 pr-4 font-medium">Veículo</th>
                      <th className="py-2 pr-4 font-medium">Motorista</th>
                      <th className="py-2 pr-4 font-medium">Km</th>
                      <th className="py-2 pr-4 font-medium">Litros</th>
                      <th className="py-2 pr-4 font-medium">Valor</th>
                      <th className="py-2 pr-4 font-medium">R$/L</th>
                      <th className="py-2 pr-4 font-medium">Consumo</th>
                      <th className="py-2 pr-4 font-medium">Posto</th>
                      <th className="py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => {
                      const v = vehicleById.get(e.vehicleId);
                      const m = metricsByEntryId.get(e.id);
                      return (
                        <tr key={e.id} className="border-b last:border-0">
                          <td className="whitespace-nowrap py-2 pr-4">{formatDateTime(e.date)}</td>
                          <td className="py-2 pr-4">{v ? v.plate : "—"}</td>
                          <td className="py-2 pr-4">{e.driverName || "—"}</td>
                          <td className="py-2 pr-4">{e.odometer.toLocaleString("pt-BR")}</td>
                          <td className="py-2 pr-4">{e.liters.toLocaleString("pt-BR")}</td>
                          <td className="py-2 pr-4">{formatBRL(e.totalCost)}</td>
                          <td className="py-2 pr-4">{m ? formatBRL(m.pricePerLiter) : "—"}</td>
                          <td className="py-2 pr-4">{m ? formatKmL(m.kmPerLiter) : "—"}</td>
                          <td className="py-2 pr-4">{e.station || "—"}</td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(e.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
