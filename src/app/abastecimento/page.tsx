"use client";

import { AppShell } from "@/components/fuelwise/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createFuelEntry,
  formatBRL,
  listVehicles,
  seedDemoDataIfEmpty,
  vehicleLabel,
  type Vehicle,
} from "@/lib/fuelwise";
import { Fuel } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function nowLocalInput(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function FuelEntryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [vehicleId, setVehicleId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [datetime, setDatetime] = useState(nowLocalInput());
  const [odometer, setOdometer] = useState("");
  const [liters, setLiters] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [station, setStation] = useState("");

  useEffect(() => {
    (async () => {
      seedDemoDataIfEmpty();
      const v = await listVehicles();
      setVehicles(v);
      if (v.length > 0) setVehicleId(v[0].id);
      setLoading(false);
    })();
  }, []);

  const pricePerLiter = useMemo(() => {
    const l = Number(liters);
    const c = Number(totalCost);
    if (l > 0 && c > 0) return c / l;
    return null;
  }, [liters, totalCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return toast.error("Selecione o veículo.");
    const odo = Number(odometer);
    const l = Number(liters);
    const c = Number(totalCost);
    if (!odo || odo <= 0) return toast.error("Informe a quilometragem (km).");
    if (!l || l <= 0) return toast.error("Informe os litros abastecidos.");
    if (!c || c <= 0) return toast.error("Informe o valor pago.");

    setSaving(true);
    try {
      await createFuelEntry({
        vehicleId,
        driverName: driverName.trim(),
        date: new Date(datetime).toISOString(),
        odometer: odo,
        liters: l,
        totalCost: c,
        station: station.trim(),
      });
      toast.success("Abastecimento registrado!");
      setOdometer("");
      setLiters("");
      setTotalCost("");
      setStation("");
      setDatetime(nowLocalInput());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Fuel className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold">Registrar abastecimento</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados do abastecimento do veículo.
          </p>
        </div>

        {!loading && vehicles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhum veículo cadastrado. Cadastre um veículo antes de registrar.
              </p>
              <Link href="/veiculos">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Cadastrar veículo</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados do abastecimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Veículo *</Label>
                  <Select value={vehicleId} onValueChange={setVehicleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {vehicleLabel(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="driver">Motorista</Label>
                  <Input
                    id="driver"
                    placeholder="Seu nome"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="datetime">Data e hora *</Label>
                  <Input
                    id="datetime"
                    type="datetime-local"
                    value={datetime}
                    onChange={(e) => setDatetime(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="odometer">Quilometragem (km) *</Label>
                    <Input
                      id="odometer"
                      type="number"
                      inputMode="decimal"
                      placeholder="123456"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="liters">Litros *</Label>
                    <Input
                      id="liters"
                      type="number"
                      inputMode="decimal"
                      placeholder="350"
                      value={liters}
                      onChange={(e) => setLiters(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cost">Valor pago (R$) *</Label>
                    <Input
                      id="cost"
                      type="number"
                      inputMode="decimal"
                      placeholder="2100.00"
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="station">Posto / local</Label>
                    <Input
                      id="station"
                      placeholder="Posto Ipiranga"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                    />
                  </div>
                </div>

                {pricePerLiter !== null && (
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                    Preço por litro: <strong>{formatBRL(pricePerLiter)}/L</strong>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? "Registrando..." : "Registrar abastecimento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
