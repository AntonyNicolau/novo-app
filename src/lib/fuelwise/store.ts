// Camada de dados do FuelWise.
// Usa Supabase quando configurado; caso contrário, cai para localStorage (modo demo),
// permitindo testar o app sem backend.

"use client";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { FuelEntry, UserRole, Vehicle } from "./types";

const LS_VEHICLES = "fuelwise.vehicles";
const LS_ENTRIES = "fuelwise.entries";
const LS_ROLE = "fuelwise.role";

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Papel do usuário (gestor x motorista) — guardado localmente para o MVP.
// ---------------------------------------------------------------------------
export function getRole(): UserRole {
  return readLS<UserRole>(LS_ROLE, "manager");
}

export function setRole(role: UserRole): void {
  writeLS(LS_ROLE, role);
}

// ---------------------------------------------------------------------------
// Mapeamento Supabase (snake_case) <-> domínio (camelCase)
// ---------------------------------------------------------------------------
/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToVehicle(r: any): Vehicle {
  return {
    id: r.id,
    plate: r.plate,
    name: r.name ?? "",
    tankCapacity: Number(r.tank_capacity ?? 0),
    createdAt: r.created_at,
  };
}

function rowToEntry(r: any): FuelEntry {
  return {
    id: r.id,
    vehicleId: r.vehicle_id,
    driverName: r.driver_name ?? "",
    date: r.date,
    odometer: Number(r.odometer ?? 0),
    liters: Number(r.liters ?? 0),
    totalCost: Number(r.total_cost ?? 0),
    station: r.station ?? "",
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const useRemote = () => isSupabaseConfigured();

// ---------------------------------------------------------------------------
// Veículos
// ---------------------------------------------------------------------------
export async function listVehicles(): Promise<Vehicle[]> {
  if (useRemote()) {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToVehicle);
  }
  return readLS<Vehicle[]>(LS_VEHICLES, []);
}

export async function createVehicle(
  input: Omit<Vehicle, "id" | "createdAt">
): Promise<Vehicle> {
  if (useRemote()) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        plate: input.plate,
        name: input.name,
        tank_capacity: input.tankCapacity,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToVehicle(data);
  }
  const vehicle: Vehicle = {
    ...input,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  const all = readLS<Vehicle[]>(LS_VEHICLES, []);
  all.push(vehicle);
  writeLS(LS_VEHICLES, all);
  return vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  if (useRemote()) {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const vehicles = readLS<Vehicle[]>(LS_VEHICLES, []).filter((v) => v.id !== id);
  writeLS(LS_VEHICLES, vehicles);
  const entries = readLS<FuelEntry[]>(LS_ENTRIES, []).filter(
    (e) => e.vehicleId !== id
  );
  writeLS(LS_ENTRIES, entries);
}

// ---------------------------------------------------------------------------
// Abastecimentos
// ---------------------------------------------------------------------------
export async function listFuelEntries(): Promise<FuelEntry[]> {
  if (useRemote()) {
    const { data, error } = await supabase
      .from("fuel_entries")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(rowToEntry);
  }
  return readLS<FuelEntry[]>(LS_ENTRIES, []);
}

export async function createFuelEntry(
  input: Omit<FuelEntry, "id" | "createdAt">
): Promise<FuelEntry> {
  if (useRemote()) {
    const { data, error } = await supabase
      .from("fuel_entries")
      .insert({
        vehicle_id: input.vehicleId,
        driver_name: input.driverName,
        date: input.date,
        odometer: input.odometer,
        liters: input.liters,
        total_cost: input.totalCost,
        station: input.station,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToEntry(data);
  }
  const entry: FuelEntry = {
    ...input,
    id: genId(),
    createdAt: new Date().toISOString(),
  };
  const all = readLS<FuelEntry[]>(LS_ENTRIES, []);
  all.push(entry);
  writeLS(LS_ENTRIES, all);
  return entry;
}

export async function deleteFuelEntry(id: string): Promise<void> {
  if (useRemote()) {
    const { error } = await supabase.from("fuel_entries").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const entries = readLS<FuelEntry[]>(LS_ENTRIES, []).filter((e) => e.id !== id);
  writeLS(LS_ENTRIES, entries);
}

// Popula dados de exemplo no modo demo (útil para a primeira visita).
export function seedDemoDataIfEmpty(): void {
  if (useRemote()) return;
  const existing = readLS<Vehicle[]>(LS_VEHICLES, []);
  if (existing.length > 0) return;

  const v1: Vehicle = {
    id: genId(),
    plate: "ABC1D23",
    name: "Volvo FH 460",
    tankCapacity: 600,
    createdAt: new Date().toISOString(),
  };
  const v2: Vehicle = {
    id: genId(),
    plate: "XYZ4E56",
    name: "Mercedes Actros",
    tankCapacity: 500,
    createdAt: new Date().toISOString(),
  };
  writeLS(LS_VEHICLES, [v1, v2]);

  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return d.toISOString();
  };

  const entries: FuelEntry[] = [
    { id: genId(), vehicleId: v1.id, driverName: "João", date: day(30), odometer: 120000, liters: 400, totalCost: 2400, station: "Posto Ipiranga BR-101", createdAt: day(30) },
    { id: genId(), vehicleId: v1.id, driverName: "João", date: day(22), odometer: 121400, liters: 380, totalCost: 2280, station: "Posto Shell", createdAt: day(22) },
    { id: genId(), vehicleId: v1.id, driverName: "João", date: day(14), odometer: 122700, liters: 360, totalCost: 2196, station: "Posto Ipiranga", createdAt: day(14) },
    // consumo ruim (pouca distância para muitos litros) -> deve gerar alerta
    { id: genId(), vehicleId: v1.id, driverName: "João", date: day(7), odometer: 123300, liters: 410, totalCost: 2501, station: "Posto BR", createdAt: day(7) },
    { id: genId(), vehicleId: v2.id, driverName: "Maria", date: day(28), odometer: 80000, liters: 300, totalCost: 1830, station: "Posto Texaco", createdAt: day(28) },
    { id: genId(), vehicleId: v2.id, driverName: "Maria", date: day(18), odometer: 81500, liters: 290, totalCost: 1769, station: "Posto Texaco", createdAt: day(18) },
    { id: genId(), vehicleId: v2.id, driverName: "Maria", date: day(9), odometer: 83100, liters: 280, totalCost: 1708, station: "Posto Ale", createdAt: day(9) },
  ];
  writeLS(LS_ENTRIES, entries);
}
