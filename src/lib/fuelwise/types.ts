// Tipos centrais do domínio FuelWise

export type UserRole = "manager" | "driver";

export interface Vehicle {
  id: string;
  plate: string; // placa, ex: ABC1D23
  name: string; // identificador/modelo, ex: "Caminhão Volvo FH"
  tankCapacity: number; // capacidade do tanque em litros
  createdAt: string; // ISO
}

export interface FuelEntry {
  id: string;
  vehicleId: string;
  driverName: string;
  date: string; // ISO datetime do abastecimento
  odometer: number; // km registrado no momento
  liters: number; // litros abastecidos
  totalCost: number; // valor total pago em R$
  station: string; // posto/local
  createdAt: string; // ISO
}

export type AlertType = "consumption" | "inconsistency";
export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  entryId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  date: string; // ISO do abastecimento que gerou o alerta
}

// Métricas calculadas para um abastecimento (em relação ao anterior)
export interface EntryMetrics {
  entry: FuelEntry;
  distance: number | null; // km rodados desde o abastecimento anterior
  kmPerLiter: number | null; // consumo
  pricePerLiter: number; // R$/litro
  costPerKm: number | null; // R$/km
}

// Resumo agregado por veículo
export interface VehicleSummary {
  vehicle: Vehicle;
  entryCount: number;
  totalLiters: number;
  totalCost: number;
  totalDistance: number;
  avgKmPerLiter: number | null;
  avgCostPerKm: number | null;
  lastOdometer: number | null;
  lastEntryDate: string | null;
}
