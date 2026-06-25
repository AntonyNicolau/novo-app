"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  C: number; // comprimento (mm)
  L: number; // largura (mm)
  H: number; // altura (mm)
  fluteColor?: string;
  className?: string;
}

// Preview 3D em tempo real da caixa "dobrada" usando transforms CSS 3D.
// Auto-rotaciona e permite arrastar para girar. Escala proporcional a C x L x H.
export function Box3D({ C, L, H, fluteColor = "#c8a06a", className }: Props) {
  const [rot, setRot] = useState({ x: -22, y: -32 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    let raf = 0;
    const tick = () => {
      setRot((r) => ({ ...r, y: r.y + 0.35 }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  // normaliza para caber numa caixa de ~180px no maior eixo
  const max = Math.max(C, L, H, 1);
  const s = 170 / max;
  const w = C * s; // largura visual (comprimento)
  const d = L * s; // profundidade (largura)
  const h = H * s; // altura

  const faceBase: React.CSSProperties = {
    position: "absolute",
    background: fluteColor,
    border: "1px solid rgba(90,60,20,0.5)",
    boxShadow: "inset 0 0 40px rgba(0,0,0,0.15)",
  };

  const onDown = (e: React.PointerEvent) => {
    setAuto(false);
    drag.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setRot((r) => ({ x: r.x - dy * 0.5, y: r.y + dx * 0.5 }));
  };
  const onUp = () => (drag.current = null);

  return (
    <div
      className={className}
      style={{
        perspective: "900px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "grab",
        touchAction: "none",
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      onDoubleClick={() => setAuto((a) => !a)}
      title="Arraste para girar • duplo clique para auto-rotação"
    >
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        }}
      >
        {/* frente */}
        <div style={{ ...faceBase, width: w, height: h, transform: `translateZ(${d / 2}px)` }} />
        {/* trás */}
        <div style={{ ...faceBase, width: w, height: h, transform: `rotateY(180deg) translateZ(${d / 2}px)`, filter: "brightness(0.8)" }} />
        {/* direita */}
        <div style={{ ...faceBase, width: d, height: h, left: (w - d) / 2, transform: `rotateY(90deg) translateZ(${w / 2}px)`, filter: "brightness(0.88)" }} />
        {/* esquerda */}
        <div style={{ ...faceBase, width: d, height: h, left: (w - d) / 2, transform: `rotateY(-90deg) translateZ(${w / 2}px)`, filter: "brightness(0.88)" }} />
        {/* topo (abas) */}
        <div style={{ ...faceBase, width: w, height: d, top: (h - d) / 2, transform: `rotateX(90deg) translateZ(${h / 2}px)`, filter: "brightness(1.08)" }}>
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(90,60,20,0.4)" }} />
        </div>
        {/* fundo */}
        <div style={{ ...faceBase, width: w, height: d, top: (h - d) / 2, transform: `rotateX(-90deg) translateZ(${h / 2}px)`, filter: "brightness(0.7)" }} />
      </div>
    </div>
  );
}
