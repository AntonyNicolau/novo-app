"use client";

import { useEffect, useRef, useState } from "react";
import { Arquetipo } from "@/lib/cartonagem/fefco";

interface Props {
  C: number; // comprimento (mm)
  L: number; // largura (mm)
  H: number; // altura (mm)
  fluteColor?: string;
  arquetipo?: Arquetipo;
  className?: string;
}

// Preview 3D em tempo real que representa a estrutura selecionada (não só uma
// caixa genérica): RSC fechada, fundo automático aberto, bandeja e telescópica.
export function Box3D({ C, L, H, fluteColor = "#c8a06a", arquetipo = "rsc", className }: Props) {
  const [rot, setRot] = useState({ x: -24, y: -34 });
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

  // normaliza para caber numa cena de ~170px no maior eixo
  const max = Math.max(C, L, H, 1);
  const s = 160 / max;
  const w = C * s;
  const d = L * s;
  const h = H * s;

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
        perspective: "950px",
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
          width: Math.max(w, 1),
          height: Math.max(h, 1),
          transformStyle: "preserve-3d",
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        }}
      >
        {arquetipo === "telescopica" || arquetipo === "rigida" ? (
          <>
            {/* fundo (bandeja) */}
            <Cuboid w={w} d={d} h={h * 0.8} oy={h * 0.12} color={fluteColor} openTop />
            {/* tampa cobrindo o topo */}
            <Cuboid
              w={w + 8}
              d={d + 8}
              h={h * 0.45}
              oy={-h * 0.32}
              color={fluteColor}
              openBottom
              bright={1.12}
            />
          </>
        ) : arquetipo === "correio" ? (
          // mailer: caixa com tampa articulada aberta
          <>
            <Cuboid w={w} d={d} h={h} color={fluteColor} openTop lockBottom />
            <Tampa w={w} d={d} h={h} color={fluteColor} aberta />
          </>
        ) : arquetipo === "maleta" ? (
          // maleta com alça: caixa fechada + alça no topo
          <>
            <Cuboid w={w} d={d} h={h} color={fluteColor} seamTop lockBottom />
            <Alca w={w} h={h} color={fluteColor} />
          </>
        ) : arquetipo === "luva" ? (
          // luva / corpo tubular: aberto nas duas extremidades
          <Cuboid w={w} d={d} h={h} color={fluteColor} openTop openBottom />
        ) : arquetipo === "rsc" ? (
          <Cuboid w={w} d={d} h={h} color={fluteColor} seamTop />
        ) : (
          // bandeja e fundo automático: caixa aberta no topo
          <Cuboid
            w={w}
            d={d}
            h={h}
            color={fluteColor}
            openTop
            lockBottom={arquetipo === "fundoAutomatico" || arquetipo === "fundoAmericano"}
          />
        )}
      </div>
    </div>
  );
}

// Tampa articulada na aresta traseira do topo (para correio/maleta).
function Tampa({
  w,
  d,
  h,
  color,
  aberta,
}: {
  w: number;
  d: number;
  h: number;
  color: string;
  aberta: boolean;
}) {
  const ang = aberta ? -118 : -6; // graus: aberta inclina para trás; fechada quase deitada
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: w,
        height: d,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 0%",
        transform: `translate(-50%, 0) translateY(${-h / 2}px) translateZ(${-d / 2}px) rotateX(${ang}deg)`,
        background: color,
        border: "1px solid rgba(90,60,20,0.5)",
        boxShadow: "inset 0 0 30px rgba(0,0,0,0.12)",
        filter: "brightness(1.12)",
      }}
    />
  );
}

// Alça (gable box): painel vertical no topo com furo oval.
function Alca({ w, h, color }: { w: number; h: number; color: string }) {
  const hw = w * 0.5;
  const hh = h * 0.5;
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: hw,
        height: hh,
        transform: `translate(-50%, -50%) translateY(${-h / 2 - hh / 2}px)`,
        background: color,
        border: "1px solid rgba(90,60,20,0.5)",
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.12)",
        filter: "brightness(1.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "46%",
          height: "30%",
          borderRadius: "999px",
          background: "#f7f4ee",
          boxShadow: "inset 0 0 0 2px rgba(90,60,20,0.45)",
        }}
      />
    </div>
  );
}

interface CuboidProps {
  w: number;
  d: number;
  h: number;
  color: string;
  oy?: number; // deslocamento vertical no espaço 3D
  openTop?: boolean;
  openBottom?: boolean;
  seamTop?: boolean; // mostra a junção das abas no topo (caixa fechada)
  lockBottom?: boolean; // mostra a trava do fundo automático
  bright?: number;
}

function Cuboid({
  w,
  d,
  h,
  color,
  oy = 0,
  openTop = false,
  openBottom = false,
  seamTop = false,
  lockBottom = false,
  bright = 1,
}: CuboidProps) {
  const face = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    background: color,
    border: "1px solid rgba(90,60,20,0.5)",
    boxShadow: "inset 0 0 36px rgba(0,0,0,0.14)",
    filter: `brightness(${bright})`,
    ...extra,
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: w,
        height: h,
        transform: `translate(-50%, -50%) translateY(${oy}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* frente */}
      <div style={face({ width: w, height: h, left: 0, top: 0, transform: `translateZ(${d / 2}px)` })} />
      {/* trás */}
      <div
        style={face({
          width: w,
          height: h,
          left: 0,
          top: 0,
          transform: `rotateY(180deg) translateZ(${d / 2}px)`,
          filter: `brightness(${bright * 0.8})`,
        })}
      />
      {/* direita */}
      <div
        style={face({
          width: d,
          height: h,
          left: (w - d) / 2,
          top: 0,
          transform: `rotateY(90deg) translateZ(${w / 2}px)`,
          filter: `brightness(${bright * 0.9})`,
        })}
      />
      {/* esquerda */}
      <div
        style={face({
          width: d,
          height: h,
          left: (w - d) / 2,
          top: 0,
          transform: `rotateY(-90deg) translateZ(${w / 2}px)`,
          filter: `brightness(${bright * 0.9})`,
        })}
      />
      {/* topo */}
      {!openTop && (
        <div
          style={face({
            width: w,
            height: d,
            left: 0,
            top: (h - d) / 2,
            transform: `rotateX(90deg) translateZ(${h / 2}px)`,
            filter: `brightness(${bright * 1.08})`,
          })}
        >
          {seamTop && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 1,
                background: "rgba(90,60,20,0.45)",
              }}
            />
          )}
        </div>
      )}
      {/* fundo */}
      {!openBottom && (
        <div
          style={face({
            width: w,
            height: d,
            left: 0,
            top: (h - d) / 2,
            transform: `rotateX(-90deg) translateZ(${h / 2}px)`,
            filter: `brightness(${bright * 0.62})`,
          })}
        >
          {lockBottom && (
            <>
              {/* trava do fundo automático: abas cruzadas */}
              <div
                style={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  top: "50%",
                  height: 2,
                  background: "rgba(40,25,5,0.55)",
                  transform: "rotate(26deg)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "8%",
                  right: "8%",
                  top: "50%",
                  height: 2,
                  background: "rgba(40,25,5,0.55)",
                  transform: "rotate(-26deg)",
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
