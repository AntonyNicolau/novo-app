import type { SessionStatus } from "@/lib/types";

export function OnlineBadge({ online }: { online: boolean }) {
  return (
    <span className={`badge ${online ? "online" : "offline"}`}>
      <span className="bdot" />
      {online ? "Online" : "Offline"}
    </span>
  );
}

export function SessionBadge({ status }: { status: SessionStatus }) {
  const map: Record<SessionStatus, { cls: string; label: string }> = {
    connected: { cls: "online", label: "Conectado" },
    disconnected: { cls: "critical", label: "Desconectado" },
    connecting: { cls: "warning", label: "Conectando" },
    qr: { cls: "qr", label: "Aguardando QR" },
  };
  const m = map[status];
  return (
    <span className={`badge ${m.cls}`}>
      <span className="bdot" />
      {m.label}
    </span>
  );
}
