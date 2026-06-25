// Biblioteca FEFCO — catálogo de estruturas e geração de geometria do desenho (dieline).
// Todas as medidas em milímetros (mm). Dimensões internas na ordem C (comprimento) x L (largura) x H (altura).

export type FefcoCode =
  | "0201"
  | "0427"
  | "0215"
  | "0300"
  | "0203"
  | "0427B";

export interface FefcoModel {
  code: FefcoCode;
  nome: string;
  familia: string;
  descricao: string;
  // Palavras-chave usadas pela IA Vision para sugerir o modelo a partir de uma foto
  visionHints: string[];
}

export const FEFCO_CATALOG: FefcoModel[] = [
  {
    code: "0201",
    nome: "Caixa Maleta (RSC)",
    familia: "02 — Caixas coladas/grampeadas",
    descricao:
      "Regular Slotted Container. Abas superiores e inferiores de mesmo comprimento que se encontram no centro. A caixa mais comum do mundo.",
    visionHints: ["caixa marrom", "abas se encontram no centro", "rsc", "caixa de transporte"],
  },
  {
    code: "0203",
    nome: "Caixa com abas sobrepostas",
    familia: "02 — Caixas coladas/grampeadas",
    descricao:
      "Abas externas se sobrepõem totalmente, reforçando o topo e o fundo. Ideal para conteúdo pesado.",
    visionHints: ["abas sobrepostas", "topo reforçado"],
  },
  {
    code: "0215",
    nome: "Caixa com aba total + autotrava",
    familia: "02 — Caixas coladas/grampeadas",
    descricao:
      "Variante do RSC com abas de fundo que se sobrepõem totalmente para fundo reforçado.",
    visionHints: ["fundo reforçado", "aba total"],
  },
  {
    code: "0300",
    nome: "Caixa telescópica (tampa e fundo)",
    familia: "03 — Caixas de duas peças (tampa + fundo)",
    descricao:
      "Duas peças independentes: bandeja de fundo e tampa telescópica que encaixa por fora.",
    visionHints: ["tampa separada", "telescópica", "duas peças"],
  },
  {
    code: "0427",
    nome: "Bandeja de montagem rápida (fundo automático)",
    familia: "04 — Bandejas e caixas de uma folha (cola/encaixe)",
    descricao:
      "Bandeja/expositor montada de uma única folha com travas laterais, sem cola. Comum em PDV.",
    visionHints: ["bandeja", "expositor", "pdv", "sem cola", "travas laterais"],
  },
  {
    code: "0427B",
    nome: "Bandeja com paredes duplas",
    familia: "04 — Bandejas e caixas de uma folha",
    descricao:
      "Bandeja reforçada com paredes laterais duplas, para hortifruti e cargas empilháveis.",
    visionHints: ["bandeja reforçada", "hortifruti", "paredes duplas"],
  },
];

export function getFefco(code: FefcoCode): FefcoModel {
  return FEFCO_CATALOG.find((f) => f.code === code) ?? FEFCO_CATALOG[0];
}

// ----------------------------------------------------------------------------
// Geometria do desenho (dieline)
// ----------------------------------------------------------------------------

export interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

export interface Dieline {
  // bounding box total da folha (lâmina) em mm
  largura: number; // eixo X
  altura: number; // eixo Y
  cut: Line[]; // linhas de corte (faca de corte)
  crease: Line[]; // linhas de vinco (faca de vinco)
  panels: Rect[]; // painéis para visualização/rotulagem
}

export interface DimsCompensadas {
  // Dimensões internas informadas
  C: number;
  L: number;
  H: number;
  // Espessura usada
  t: number;
  // Acréscimos lineares já aplicados (compensação de vinco)
  Cc: number; // comprimento compensado por painel
  Lc: number; // largura compensada por painel
  Hc: number; // altura compensada por painel
  aba: number; // tamanho da aba (metade da largura compensada)
  abaCola: number; // aba de cola
}

export interface ParamsGeometria {
  C: number;
  L: number;
  H: number;
  t: number; // espessura real do papelão (mm)
  abaCola?: number; // aba de cola (mm)
}

// Compensação de vinco: como o papelão tem espessura, somamos acréscimos
// lineares às dimensões internas para que o volume e as dobras fiquem perfeitos.
export function compensar({ C, L, H, t, abaCola = 35 }: ParamsGeometria): DimsCompensadas {
  const Cc = C + t; // cada painel de comprimento ganha 1x espessura
  const Lc = L + t; // cada painel de largura ganha 1x espessura
  const Hc = H + t; // painel de altura ganha 1x espessura
  const aba = (L + t) / 2; // aba = metade da largura compensada (abas se encontram no centro no 0201)
  return { C, L, H, t, Cc, Lc, Hc, aba, abaCola };
}

// Geometria do FEFCO 0201 (RSC) — modelo de referência totalmente detalhado.
function dieline0201(p: ParamsGeometria): Dieline {
  const d = compensar(p);
  const { Cc, Lc, Hc, aba, abaCola } = d;

  // Eixo X: aba de cola | C | L | C | L
  const xs = [0, abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc];
  const larguraTotal = abaCola + 2 * Cc + 2 * Lc;
  // Eixo Y: aba inferior | corpo (Hc) | aba superior
  const alturaTotal = aba + Hc + aba;
  const yBottomFlap = 0;
  const yBody = aba;
  const yTopFlap = aba + Hc;

  const cut: Line[] = [];
  const crease: Line[] = [];
  const panels: Rect[] = [];

  // Contorno externo (corte)
  cut.push({ x1: 0, y1: yBody, x2: 0, y2: yBody + Hc }); // borda esquerda (aba de cola)
  cut.push({ x1: larguraTotal, y1: yBody, x2: larguraTotal, y2: yBody + Hc }); // borda direita
  // topo e base do corpo formados por abas — desenhamos contorno completo das abas + slots

  const panelXs = [abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc];
  const panelWs = [Cc, Lc, Cc, Lc];
  const labels = ["C", "L", "C", "L"];

  // Vincos verticais (entre painéis) — linha de vinco do corpo (altura Hc)
  // posição de cada divisória vertical
  xs.slice(1).forEach((x) => {
    crease.push({ x1: x, y1: yBody, x2: x, y2: yBody + Hc });
  });

  // Vincos horizontais (linhas de dobra das abas) — atravessam todo o corpo
  crease.push({ x1: abaCola, y1: yBody, x2: larguraTotal, y2: yBody }); // dobra abas inferiores
  crease.push({ x1: abaCola, y1: yTopFlap, x2: larguraTotal, y2: yTopFlap }); // dobra abas superiores

  // Abas (corte): cada painel tem aba superior e inferior, com slots entre elas
  panelXs.forEach((px, i) => {
    const pw = panelWs[i];
    // aba inferior
    cut.push({ x1: px, y1: yBottomFlap, x2: px + pw, y2: yBottomFlap }); // borda externa inferior
    cut.push({ x1: px, y1: yBottomFlap, x2: px, y2: yBody }); // lateral esquerda do slot inferior
    cut.push({ x1: px + pw, y1: yBottomFlap, x2: px + pw, y2: yBody }); // lateral direita
    // aba superior
    cut.push({ x1: px, y1: alturaTotal, x2: px + pw, y2: alturaTotal }); // borda externa superior
    cut.push({ x1: px, y1: yTopFlap, x2: px, y2: alturaTotal }); // lateral esquerda
    cut.push({ x1: px + pw, y1: yTopFlap, x2: px + pw, y2: alturaTotal }); // lateral direita

    panels.push({ x: px, y: yBody, w: pw, h: Hc, label: labels[i] });
  });

  // aba de cola (painel estreito à esquerda)
  panels.push({ x: 0, y: yBody, w: abaCola, h: Hc, label: "cola" });
  crease.push({ x1: abaCola, y1: yBody, x2: abaCola, y2: yBody + Hc });

  return { largura: larguraTotal, altura: alturaTotal, cut, crease, panels };
}

// Bandeja de uma folha (família 04, ex. 0427) — aproximação paramétrica:
// fundo C x L com 4 paredes de altura H e abas de canto.
function dielineBandeja(p: ParamsGeometria): Dieline {
  const d = compensar(p);
  const { Cc, Lc, Hc } = d;
  const larguraTotal = Cc + 2 * Hc + 2 * Hc; // fundo + paredes + abas de canto
  const alturaTotal = Lc + 2 * Hc;

  const cut: Line[] = [];
  const crease: Line[] = [];
  const panels: Rect[] = [];

  // contorno externo simples
  cut.push({ x1: 0, y1: 0, x2: larguraTotal, y2: 0 });
  cut.push({ x1: larguraTotal, y1: 0, x2: larguraTotal, y2: alturaTotal });
  cut.push({ x1: larguraTotal, y1: alturaTotal, x2: 0, y2: alturaTotal });
  cut.push({ x1: 0, y1: alturaTotal, x2: 0, y2: 0 });

  const x0 = 2 * Hc;
  const y0 = Hc;
  // fundo
  panels.push({ x: x0, y: y0, w: Cc, h: Lc, label: "fundo" });
  // vincos do fundo
  crease.push({ x1: x0, y1: y0, x2: x0 + Cc, y2: y0 });
  crease.push({ x1: x0, y1: y0 + Lc, x2: x0 + Cc, y2: y0 + Lc });
  crease.push({ x1: x0, y1: y0, x2: x0, y2: y0 + Lc });
  crease.push({ x1: x0 + Cc, y1: y0, x2: x0 + Cc, y2: y0 + Lc });
  // paredes
  panels.push({ x: x0, y: 0, w: Cc, h: Hc, label: "H" });
  panels.push({ x: x0, y: y0 + Lc, w: Cc, h: Hc, label: "H" });
  panels.push({ x: 0, y: y0, w: Hc, h: Lc, label: "H" });
  panels.push({ x: x0 + Cc, y: y0, w: Hc, h: Lc, label: "H" });

  return { largura: larguraTotal, altura: alturaTotal, cut, crease, panels };
}

// Caixa telescópica (0300): geramos o fundo (bandeja) como referência principal.
function dielineTelescopica(p: ParamsGeometria): Dieline {
  return dielineBandeja(p);
}

export function gerarDieline(code: FefcoCode, p: ParamsGeometria): Dieline {
  switch (code) {
    case "0201":
    case "0203":
    case "0215":
      return dieline0201(p);
    case "0427":
    case "0427B":
      return dielineBandeja(p);
    case "0300":
      return dielineTelescopica(p);
    default:
      return dieline0201(p);
  }
}
