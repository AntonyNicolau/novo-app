"use client";

import { AppShell } from "@/components/fuelwise/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createVehicle,
  deleteVehicle,
  formatNumber,
  listVehicles,
  seedDemoDataIfEmpty,
  type Vehicle,
} from "@/lib/fuelwise";
import { Plus, Trash2, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [plate, setPlate] = useState("");
  const [name, setName] = useState("");
  const [tankCapacity, setTankCapacity] = useState("");

  const load = async () => {
    seedDemoDataIfEmpty();
    const v = await listVehicles();
    setVehicles(v);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) {
      toast.error("Informe a placa do veículo.");
      return;
    }
    const cap = Number(tankCapacity);
    if (!cap || cap <= 0) {
      toast.error("Informe a capacidade do tanque (litros).");
      return;
    }
    setSaving(true);
    try {
      await createVehicle({
        plate: plate.trim().toUpperCase(),
        name: name.trim(),
        tankCapacity: cap,
      });
      toast.success("Veículo cadastrado!");
      setPlate("");
      setName("");
      setTankCapacity("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar veículo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (v: Vehicle) => {
    if (!confirm(`Excluir o veículo ${v.plate}? Os abastecimentos vinculados também serão removidos.`)) {
      return;
    }
    try {
      await deleteVehicle(v.id);
      toast.success("Veículo removido.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Veículos</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre os veículos da frota para vincular os abastecimentos.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="h-4 w-4" /> Novo veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    placeholder="ABC1D23"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    maxLength={8}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="name">Identificação / Modelo</Label>
                  <Input
                    id="name"
                    placeholder="Volvo FH 460"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tank">Capacidade do tanque (L) *</Label>
                  <Input
                    id="tank"
                    type="number"
                    inputMode="decimal"
                    placeholder="600"
                    value={tankCapacity}
                    onChange={(e) => setTankCapacity(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {saving ? "Salvando..." : "Cadastrar veículo"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frota ({vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : vehicles.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
                  <Truck className="h-8 w-8" />
                  <p className="text-sm">Nenhum veículo cadastrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{v.plate}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.name || "Sem identificação"} · Tanque {formatNumber(v.tankCapacity)} L
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(v)}
                        className="text-muted-foreground hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
