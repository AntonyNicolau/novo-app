"use client";
import { useState } from "react";
import { initials } from "@/lib/format";

export default function Avatar({
  src,
  name,
  size = "md",
  online = false,
}: {
  src: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
}) {
  const [err, setErr] = useState(false);
  const cls = `avatar ${size === "md" ? "" : size} ${online ? "ring-online" : ""}`;
  if (src && !err) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        className={cls}
        src={src}
        alt={name}
        onError={() => setErr(true)}
      />
    );
  }
  return <div className={cls}>{initials(name)}</div>;
}
