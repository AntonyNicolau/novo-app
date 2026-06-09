"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDate, sortAlertsBySeverity, type Alert } from "@/lib/fuelwise";
import { CheckCircle2, Fuel, TriangleAlert } from "lucide-react";

const STYLES: Record<
  Alert["severity"],
  { wrap: string; icon: string; badge: string; label: string }
> = {
  critical: {
    wrap: "border-red-200 bg-red-50",
    icon: "text-red-600",
    badge: "bg-red-600 text-white",
    label: "Crítico",
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50",
    icon: "text-amber-600",
    badge: "bg-amber-500 text-white",
    label: "Atenção",
  },
  info: {
    wrap: "border-blue-200 bg-blue-50",
    icon: "text-blue-600",
    badge: "bg-blue-500 text-white",
    label: "Info",
  },
};

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          <p className="font-medium">Tudo certo!</p>
          <p className="text-sm text-muted-foreground">
            Nenhuma inconsistência ou consumo fora do padrão detectado.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = sortAlertsBySeverity(alerts);

  return (
    <div className="space-y-2">
      {sorted.map((a) => {
        const style = STYLES[a.severity];
        const Icon = a.type === "consumption" ? Fuel : TriangleAlert;
        return (
          <div
            key={a.id}
            className={cn("flex items-start gap-3 rounded-lg border p-3", style.wrap)}
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{a.title}</span>
                <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", style.badge)}>
                  {style.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{a.message}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.vehicleLabel} · {formatDate(a.date)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
