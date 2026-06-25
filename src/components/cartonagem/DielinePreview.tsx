"use client";

import { Dieline } from "@/lib/cartonagem/fefco";

interface Props {
  dieline: Dieline;
  className?: string;
}

// Renderiza o desenho da faca (dieline) em SVG. Vermelho = corte, azul tracejado = vinco.
export function DielinePreview({ dieline, className }: Props) {
  const pad = Math.max(dieline.largura, dieline.altura) * 0.06 + 10;
  const vbW = dieline.largura + pad * 2;
  const vbH = dieline.altura + pad * 2;

  return (
    <svg
      viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`}
      className={className}
      // inverte Y para que o desenho fique na orientação usual (origem embaixo)
      style={{ transform: "scaleY(-1)", background: "#fbfbf9" }}
    >
      {/* painéis (rótulos) */}
      {dieline.panels.map((p, i) => (
        <g key={`p${i}`}>
          <rect
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            fill="#f2ede3"
            stroke="none"
            opacity={0.6}
          />
          <text
            x={p.x + p.w / 2}
            y={p.y + p.h / 2}
            fontSize={Math.min(p.w, p.h) * 0.28}
            fill="#9a8c6a"
            textAnchor="middle"
            dominantBaseline="central"
            style={{ transform: "scaleY(-1)", transformOrigin: `${p.x + p.w / 2}px ${p.y + p.h / 2}px` }}
          >
            {p.label}
          </text>
        </g>
      ))}

      {/* vincos */}
      {dieline.crease.map((l, i) => (
        <line
          key={`c${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#2563eb"
          strokeWidth={Math.max(dieline.largura, dieline.altura) * 0.003}
          strokeDasharray={`${vbW * 0.012},${vbW * 0.008}`}
        />
      ))}

      {/* cortes */}
      {dieline.cut.map((l, i) => (
        <line
          key={`k${i}`}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#dc2626"
          strokeWidth={Math.max(dieline.largura, dieline.altura) * 0.004}
        />
      ))}
    </svg>
  );
}
