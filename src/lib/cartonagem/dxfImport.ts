// Leitor de DXF 100% no navegador (sem dependência, sem servidor, sem custo).
// Interpreta LINE, LWPOLYLINE, POLYLINE/VERTEX, ARC e CIRCLE, separa as linhas
// por camada (corte x vinco) e devolve um Dieline pronto para o preview e a
// metragem. Coordenadas em mm (converte a partir de $INSUNITS quando presente).

import { Dieline, Line } from "./fefco";

interface Par {
  code: number;
  value: string;
}

interface Entidade {
  type: string;
  codes: Par[];
}

export interface ResultadoDXF {
  dieline: Dieline;
  entidades: number;
  unidade: string;
}

function tokenizar(texto: string): Par[] {
  const linhas = texto.split(/\r\n|\r|\n/);
  const pares: Par[] = [];
  for (let i = 0; i + 1 < linhas.length; i += 2) {
    const code = parseInt(linhas[i].trim(), 10);
    if (Number.isNaN(code)) continue;
    pares.push({ code, value: linhas[i + 1].trim() });
  }
  return pares;
}

// Fator de conversão para mm a partir do código $INSUNITS do DXF.
function fatorUnidade(pares: Par[]): { fator: number; nome: string } {
  for (let i = 0; i < pares.length - 2; i++) {
    if (pares[i].code === 9 && pares[i].value === "$INSUNITS") {
      const u = parseInt(pares[i + 1].value, 10);
      if (u === 1) return { fator: 25.4, nome: "pol" }; // polegadas
      if (u === 4) return { fator: 1, nome: "mm" };
      if (u === 5) return { fator: 10, nome: "cm" };
      if (u === 6) return { fator: 1000, nome: "m" };
      break;
    }
  }
  return { fator: 1, nome: "mm" }; // padrão na cartonagem
}

function extrairEntidades(pares: Par[]): Entidade[] {
  const entidades: Entidade[] = [];
  let secao = "";
  let esperaNomeSecao = false;
  let atual: Entidade | null = null;

  const flush = () => {
    if (atual && secao === "ENTITIES") entidades.push(atual);
    atual = null;
  };

  for (const p of pares) {
    if (p.code === 0) {
      if (p.value === "SECTION") {
        flush();
        esperaNomeSecao = true;
        continue;
      }
      if (p.value === "ENDSEC") {
        flush();
        secao = "";
        continue;
      }
      flush();
      atual = { type: p.value, codes: [] };
      continue;
    }
    if (esperaNomeSecao && p.code === 2) {
      secao = p.value;
      esperaNomeSecao = false;
      continue;
    }
    if (atual) atual.codes.push(p);
  }
  flush();
  return entidades;
}

function num(codes: Par[], code: number): number | undefined {
  const p = codes.find((c) => c.code === code);
  return p ? parseFloat(p.value) : undefined;
}

function camada(codes: Par[]): string {
  return codes.find((c) => c.code === 8)?.value ?? "0";
}

// Classifica a camada como vinco ou corte pelo nome (padrões comuns da indústria).
function ehVinco(layer: string): boolean {
  return /vinc|crease|cren|score|fold|dobr|rule|half/i.test(layer);
}

function arcoParaLinhas(cx: number, cy: number, r: number, a0: number, a1: number): Line[] {
  let fim = a1;
  if (fim < a0) fim += 360;
  const passos = Math.max(6, Math.ceil((fim - a0) / 12));
  const linhas: Line[] = [];
  let prevX = 0;
  let prevY = 0;
  for (let k = 0; k <= passos; k++) {
    const ang = ((a0 + ((fim - a0) * k) / passos) * Math.PI) / 180;
    const x = cx + r * Math.cos(ang);
    const y = cy + r * Math.sin(ang);
    if (k > 0) linhas.push({ x1: prevX, y1: prevY, x2: x, y2: y });
    prevX = x;
    prevY = y;
  }
  return linhas;
}

function vertices(codes: Par[]): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  let x: number | undefined;
  for (const c of codes) {
    if (c.code === 10) x = parseFloat(c.value);
    else if (c.code === 20 && x !== undefined) {
      pts.push({ x, y: parseFloat(c.value) });
      x = undefined;
    }
  }
  return pts;
}

export function lerDXF(texto: string): ResultadoDXF {
  const pares = tokenizar(texto);
  const { fator, nome } = fatorUnidade(pares);
  const entidades = extrairEntidades(pares);

  const cut: Line[] = [];
  const crease: Line[] = [];
  const add = (l: Line, layer: string) => (ehVinco(layer) ? crease : cut).push(l);

  for (let i = 0; i < entidades.length; i++) {
    const e = entidades[i];
    const layer = camada(e.codes);

    if (e.type === "LINE") {
      const x1 = num(e.codes, 10);
      const y1 = num(e.codes, 20);
      const x2 = num(e.codes, 11);
      const y2 = num(e.codes, 21);
      if ([x1, y1, x2, y2].every((v) => v !== undefined)) {
        add({ x1: x1!, y1: y1!, x2: x2!, y2: y2! }, layer);
      }
    } else if (e.type === "LWPOLYLINE") {
      const pts = vertices(e.codes);
      const fechado = (num(e.codes, 70) ?? 0) % 2 === 1;
      for (let k = 0; k < pts.length - 1; k++) {
        add({ x1: pts[k].x, y1: pts[k].y, x2: pts[k + 1].x, y2: pts[k + 1].y }, layer);
      }
      if (fechado && pts.length > 2) {
        const a = pts[pts.length - 1];
        const b = pts[0];
        add({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }, layer);
      }
    } else if (e.type === "POLYLINE") {
      // vértices vêm como entidades VERTEX seguintes, até SEQEND
      const pts: { x: number; y: number }[] = [];
      let j = i + 1;
      for (; j < entidades.length && entidades[j].type === "VERTEX"; j++) {
        const x = num(entidades[j].codes, 10);
        const y = num(entidades[j].codes, 20);
        if (x !== undefined && y !== undefined) pts.push({ x, y });
      }
      i = j; // pula os VERTEX (e o SEQEND, se houver)
      const fechado = (num(e.codes, 70) ?? 0) % 2 === 1;
      for (let k = 0; k < pts.length - 1; k++) {
        add({ x1: pts[k].x, y1: pts[k].y, x2: pts[k + 1].x, y2: pts[k + 1].y }, layer);
      }
      if (fechado && pts.length > 2) {
        const a = pts[pts.length - 1];
        const b = pts[0];
        add({ x1: a.x, y1: a.y, x2: b.x, y2: b.y }, layer);
      }
    } else if (e.type === "ARC") {
      const cx = num(e.codes, 10);
      const cy = num(e.codes, 20);
      const r = num(e.codes, 40);
      const a0 = num(e.codes, 50);
      const a1 = num(e.codes, 51);
      if ([cx, cy, r, a0, a1].every((v) => v !== undefined)) {
        arcoParaLinhas(cx!, cy!, r!, a0!, a1!).forEach((l) => add(l, layer));
      }
    } else if (e.type === "CIRCLE") {
      const cx = num(e.codes, 10);
      const cy = num(e.codes, 20);
      const r = num(e.codes, 40);
      if ([cx, cy, r].every((v) => v !== undefined)) {
        arcoParaLinhas(cx!, cy!, r!, 0, 360).forEach((l) => add(l, layer));
      }
    }
  }

  const todas = [...cut, ...crease];
  if (todas.length === 0) {
    throw new Error("Nenhuma geometria reconhecida no DXF (LINE/POLYLINE/ARC/CIRCLE).");
  }

  // bounding box + normalização para origem (0,0) e conversão de unidade
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const l of todas) {
    minX = Math.min(minX, l.x1, l.x2);
    minY = Math.min(minY, l.y1, l.y2);
    maxX = Math.max(maxX, l.x1, l.x2);
    maxY = Math.max(maxY, l.y1, l.y2);
  }
  const norm = (l: Line): Line => ({
    x1: (l.x1 - minX) * fator,
    y1: (l.y1 - minY) * fator,
    x2: (l.x2 - minX) * fator,
    y2: (l.y2 - minY) * fator,
  });

  const dieline: Dieline = {
    largura: (maxX - minX) * fator,
    altura: (maxY - minY) * fator,
    cut: cut.map(norm),
    crease: crease.map(norm),
    panels: [],
  };

  return { dieline, entidades: entidades.length, unidade: nome };
}
