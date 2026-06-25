import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "var(--brand)",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
}) {
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className="stat-icon" style={{ color }}>
          <Icon size={19} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  );
}
