// Lógica de cálculo de consumo e motor de alertas (funções puras)

import type {
  Alert,
  AlertSeverity,
  EntryMetrics,
  FuelEntry,
  Vehicle,
  VehicleSummary,
} from "./types";

// Faixa de preço plausível para o diesel (R$/litro). Fora disso = inconsistência.
export const DIESEL_PRICE_MIN = 2.5;
export const DIESEL_PRICE_MAX = 12;

// Desvio relativo do consumo (km/l) em relação à média histórica que dispara alerta.
export const CONSUMPTION_DEVIATION_THRESHOLD = 0.2; // 20%

export function vehicleLabel(v: Vehicle): string {
  return v.name ? `${v.name} (${v.plate})` : v.plate;
}

// Ordena abastecimentos de forma cronológica/odométrica para um veículo.
function sortEntries(entries: FuelEntry[]): FuelEntry[] {
  return [...entries].sort((a, b) => {
    const d = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (d !== 0) return d;
    return a.odometer - b.odometer;
  });
}

// Calcula métricas (distância, km/l, R$/l, R$/km) de cada abastecimento de UM veículo.
export function computeEntryMetrics(entries: FuelEntry[]): EntryMetrics[] {
  const sorted = sortEntries(entries);
  return sorted.map((entry, i) => {
    const prev = i > 0 ? sorted[i - 1] : null;
    const distance = prev ? entry.odometer - prev.odometer : null;
    const validDistance = distance !== null && distance > 0 ? distance : null;
    const kmPerLiter =
      validDistance !== null && entry.liters > 0
        ? validDistance / entry.liters
        : null;
    const pricePerLiter = entry.liters > 0 ? entry.totalCost / entry.liters : 0;
    const costPerKm =
      validDistance !== null && entry.totalCost > 0
        ? entry.totalCost / validDistance
        : null;
    return { entry, distance, kmPerLiter, pricePerLiter, costPerKm };
  });
}

// Resumo agregado de um veículo.
export function summarizeVehicle(
  vehicle: Vehicle,
  entries: FuelEntry[]
): VehicleSummary {
  const metrics = computeEntryMetrics(entries);
  const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
  const totalCost = entries.reduce((s, e) => s + e.totalCost, 0);
  const totalDistance = metrics.reduce(
    (s, m) => s + (m.distance && m.distance > 0 ? m.distance : 0),
    0
  );
  const kmPerLiterValues = metrics
    .map((m) => m.kmPerLiter)
    .filter((v): v is number => v !== null);
  const avgKmPerLiter =
    kmPerLiterValues.length > 0
      ? kmPerLiterValues.reduce((s, v) => s + v, 0) / kmPerLiterValues.length
      : null;
  const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : null;

  const sorted = sortEntries(entries);
  const last = sorted[sorted.length - 1] ?? null;

  return {
    vehicle,
    entryCount: entries.length,
    totalLiters,
    totalCost,
    totalDistance,
    avgKmPerLiter,
    avgCostPerKm,
    lastOdometer: last ? last.odometer : null,
    lastEntryDate: last ? last.date : null,
  };
}

function makeAlert(
  vehicle: Vehicle,
  entry: FuelEntry,
  type: Alert["type"],
  severity: AlertSeverity,
  title: string,
  message: string
): Alert {
  return {
    id: `${entry.id}-${type}-${title}`,
    vehicleId: vehicle.id,
    vehicleLabel: vehicleLabel(vehicle),
    entryId: entry.id,
    type,
    severity,
    title,
    message,
    date: entry.date,
  };
}

// Motor de alertas: avalia inconsistências e desvios de consumo de um veículo.
export function detectVehicleAlerts(
  vehicle: Vehicle,
  entries: FuelEntry[]
): Alert[] {
  const alerts: Alert[] = [];
  const metrics = computeEntryMetrics(entries);

  // Média de consumo "saudável" do veículo (exclui o próprio ponto ao comparar).
  const allKmL = metrics
    .map((m) => m.kmPerLiter)
    .filter((v): v is number => v !== null);

  metrics.forEach((m, i) => {
    const { entry } = m;

    // 1) km regressivo ou parado
    if (m.distance !== null && m.distance <= 0) {
      alerts.push(
        makeAlert(
          vehicle,
          entry,
          "inconsistency",
          "critical",
          "Quilometragem inconsistente",
          `O hodômetro (${entry.odometer.toLocaleString("pt-BR")} km) é menor ou igual ao do abastecimento anterior. Verifique o registro.`
        )
      );
    }

    // 2) litros acima da capacidade do tanque
    if (vehicle.tankCapacity > 0 && entry.liters > vehicle.tankCapacity) {
      alerts.push(
        makeAlert(
          vehicle,
          entry,
          "inconsistency",
          "warning",
          "Litros acima da capacidade",
          `Foram registrados ${entry.liters.toLocaleString("pt-BR")} L, acima da capacidade do tanque (${vehicle.tankCapacity} L).`
        )
      );
    }

    // 3) preço por litro fora da faixa plausível
    if (
      m.pricePerLiter > 0 &&
      (m.pricePerLiter < DIESEL_PRICE_MIN || m.pricePerLiter > DIESEL_PRICE_MAX)
    ) {
      alerts.push(
        makeAlert(
          vehicle,
          entry,
          "inconsistency",
          "warning",
          "Preço por litro atípico",
          `R$ ${m.pricePerLiter.toFixed(2)}/L está fora da faixa esperada (R$ ${DIESEL_PRICE_MIN.toFixed(2)}–${DIESEL_PRICE_MAX.toFixed(2)}). Confira a nota fiscal.`
        )
      );
    }

    // 4) consumo fora do padrão (desvio vs. média dos demais abastecimentos)
    if (m.kmPerLiter !== null && allKmL.length >= 3) {
      const others = allKmL.filter((_, idx) => idx !== i);
      if (others.length >= 2) {
        const avg = others.reduce((s, v) => s + v, 0) / others.length;
        if (avg > 0) {
          const deviation = (m.kmPerLiter - avg) / avg;
          if (deviation < -CONSUMPTION_DEVIATION_THRESHOLD) {
            alerts.push(
              makeAlert(
                vehicle,
                entry,
                "consumption",
                "warning",
                "Consumo acima do normal",
                `Rendimento de ${m.kmPerLiter.toFixed(2)} km/L, ${Math.abs(deviation * 100).toFixed(0)}% abaixo da média do veículo (${avg.toFixed(2)} km/L).`
              )
            );
          }
        }
      }
    }
  });

  return alerts;
}

// Alertas de toda a frota, mais recentes primeiro.
export function detectFleetAlerts(
  vehicles: Vehicle[],
  entries: FuelEntry[]
): Alert[] {
  const alerts: Alert[] = [];
  for (const v of vehicles) {
    const vEntries = entries.filter((e) => e.vehicleId === v.id);
    alerts.push(...detectVehicleAlerts(v, vEntries));
  }
  return alerts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

const SEVERITY_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function sortAlertsBySeverity(alerts: Alert[]): Alert[] {
  return [...alerts].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
}
