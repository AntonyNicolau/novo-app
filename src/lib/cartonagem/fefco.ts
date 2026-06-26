// Biblioteca FEFCO — catálogo de estruturas e geração de geometria do desenho (dieline).
// Todas as medidas em milímetros (mm). Dimensões internas na ordem C (comprimento) x L (largura) x H (altura).

export type FefcoCode = string;

// Arquétipo estrutural — define como o modelo é desenhado (2D) e dobrado (3D).
export type Arquetipo =
  | "rsc"
  | "fundoAutomatico"
  | "bandeja"
  | "telescopica"
  | "luva"
  | "rigida"
  | "correio"
  | "maleta"
  | "fundoAmericano";

export interface FefcoModel {
  code: FefcoCode;
  nome: string;
  familia: string;
  grupo: string; // "02".."09"
  descricao: string;
  arquetipo: Arquetipo;
  visionHints?: string[];
}

// Famílias FEFCO e seu arquétipo/descrição padrão.
const FAMILIAS: Record<string, { nome: string; arq: Arquetipo; desc: string }> = {
  "00": {
    nome: "⭐ Mais usados",
    arq: "rsc",
    desc: "Modelos comerciais mais usados no dia a dia.",
  },
  "02": {
    nome: "02 — Caixas slotadas (coladas/grampeadas)",
    arq: "rsc",
    desc: "Caixa de uma peça com abas; corpo formado por vincos e fechamento por abas no topo e no fundo.",
  },
  "03": {
    nome: "03 — Caixas telescópicas (tampa + fundo)",
    arq: "telescopica",
    desc: "Duas ou mais peças independentes: tampa e fundo que se encaixam (telescópico).",
  },
  "04": {
    nome: "04 — Pastas e bandejas (uma folha)",
    arq: "bandeja",
    desc: "Bandeja/pasta montada de uma única folha, com travas, encaixe ou cola.",
  },
  "05": {
    nome: "05 — Caixas tipo luva e gaveta (Slide)",
    arq: "luva",
    desc: "Luva e gaveta deslizante; corpo tubular aberto nas extremidades.",
  },
  "06": {
    nome: "06 — Caixas rígidas (duas peças)",
    arq: "rigida",
    desc: "Caixa rígida de duas peças, com tampa e fundo independentes, montada com fitas/cantoneiras.",
  },
  "07": {
    nome: "07 — Caixas pré-coladas (Ready-glued)",
    arq: "fundoAutomatico",
    desc: "Entregue pré-colada; montagem rápida (crash-lock / fundo automático).",
  },
  "09": {
    nome: "09 — Acessórios internos (divisórias)",
    arq: "bandeja",
    desc: "Divisórias, berços, calços e proteções internas.",
  },
};

// Sobrescritas para modelos notáveis (nome amigável, descrição e/ou arquétipo).
const NOTAVEIS: Record<string, { nome: string; desc?: string; arq?: Arquetipo; hints?: string[] }> = {
  CORREIO: {
    nome: "Caixa Correio / Mailer (FEFCO 0427)",
    desc: "Caixa de uma peça para envio (Correios/transportadora), estilo FEFCO 0427: fundo, paredes, tampa com abas laterais que travam dentro da caixa (RETT).",
    arq: "correio",
    hints: ["mailer", "e-commerce", "correio", "sedex", "0427"],
  },
  AMERICANO: {
    nome: "Caixa Fechamento + Fundo Americano (0216)",
    desc: "Topo com fechamento americano (abas no centro) e fundo automático com trava (abas anguladas que se encaixam, estilo FEFCO 0216).",
    arq: "fundoAmericano",
    hints: ["fechamento americano", "fundo americano", "trava", "0216"],
  },
  MALETA: {
    nome: "Caixa Maleta com Alça (FEFCO 0217)",
    desc: "Caixa de uma peça com topo em duas águas e alça (furo oval) e fundo automático de trava (FEFCO 0217). Usada para transporte de alimentos, presentes e kits.",
    arq: "maleta",
    hints: ["maleta", "alça", "gable", "0217", "transporte"],
  },
  "0201": {
    nome: "Caixa Maleta (RSC)",
    desc: "Regular Slotted Container. Abas superiores e inferiores de mesmo comprimento que se encontram no centro. A caixa mais comum do mundo.",
    hints: ["caixa marrom", "rsc", "abas se encontram no centro", "caixa de transporte"],
  },
  "0200": { nome: "Half Slotted Container (HSC)", desc: "Como a RSC, porém sem as abas de um dos lados (caixa aberta)." },
  "0202": { nome: "RSC com abas de fundo coladas", desc: "RSC com fundo colado para reforço." },
  "0203": { nome: "Caixa com abas sobrepostas (FOL)", desc: "Abas externas se sobrepõem totalmente, reforçando topo e fundo. Ideal para conteúdo pesado.", hints: ["abas sobrepostas"] },
  "0204": { nome: "Abas externas totalmente sobrepostas", desc: "Sobreposição total das quatro abas externas." },
  "0205": { nome: "Center Special Slotted (CSSC)", desc: "Abas internas e externas se encontram no centro." },
  "0206": { nome: "Full Overlap (FOL) total", desc: "Todas as abas sobrepostas para máxima resistência ao empilhamento." },
  "0209": { nome: "RSC com abas desiguais", desc: "Abas de comprimentos diferentes para ajuste de fechamento." },
  "0215": { nome: "Caixa com fundo automático / autotrava", desc: "Variante com abas de fundo que se sobrepõem totalmente para fundo reforçado.", arq: "fundoAutomatico", hints: ["fundo reforçado", "autotrava"] },
  "0216": { nome: "Fundo americano (trava automática)", desc: "Topo com fechamento americano (abas no centro) e fundo automático com abas anguladas que se travam.", arq: "fundoAmericano", hints: ["fundo americano", "trava", "crash-lock"] },
  "0217": { nome: "Caixa Maleta com alça (0217)", desc: "Topo em duas águas com painel de alça (furo oval) e fundo automático de trava. A clássica caixa maleta de transporte.", arq: "maleta", hints: ["maleta", "alça", "gable", "0217"] },
  "0300": { nome: "Telescópica tampa + fundo", desc: "Fundo (bandeja) e tampa telescópica que encaixa por fora.", hints: ["tampa separada", "telescópica"] },
  "0306": { nome: "Bandeja + tampa telescópica parcial", desc: "Tampa cobre parte da altura do fundo." },
  "0310": { nome: "Tampa telescópica total", desc: "Tampa cobre toda a altura do fundo." },
  "0427": { nome: "Caixa Correio / Mailer (RETT)", desc: "Caixa de envio de uma peça: fundo, paredes e tampa com abas laterais que travam dentro da caixa. A clássica caixa correio do e-commerce.", arq: "correio", hints: ["mailer", "correio", "e-commerce", "rett"] },
  "0427B": { nome: "Bandeja com paredes duplas", desc: "Bandeja reforçada com paredes laterais duplas (hortifruti, empilhável).", arq: "bandeja" },
  "0426": { nome: "Bandeja com cantos colados", desc: "Bandeja com cantos colados, paredes firmes." },
  "0470": { nome: "Bandeja de fundo automático", desc: "Bandeja que arma sozinha ao levantar as paredes." },
  "0500": { nome: "Luva (sleeve) externa", desc: "Luva tubular que envolve uma bandeja interna." },
  "0501": { nome: "Caixa luva + gaveta", desc: "Gaveta deslizante dentro de uma luva." },
  "0600": { nome: "Caixa rígida 2 peças + tampa", desc: "Corpo e tampa rígidos montados com cantoneiras/fitas." },
  "0700": { nome: "Caixa pré-colada (crash-lock)", desc: "Entregue plana e pré-colada; fundo arma sozinho (crash-lock).", arq: "fundoAutomatico" },
  "0711": { nome: "Pré-colada fundo automático", desc: "Fundo automático pré-colado, montagem em segundos.", arq: "fundoAutomatico" },
  "0900": { nome: "Divisória / colmeia", desc: "Divisória interna em grade para separar itens." },
  "0904": { nome: "Berço / calço interno", desc: "Calço de proteção interna." },
};

// Códigos padrão FEFCO por família (conjunto amplo do catálogo 2022).
const CODIGOS: Record<string, string[]> = {
  "00": ["CORREIO", "AMERICANO", "MALETA"],
  "02": ["0200","0201","0202","0203","0204","0205","0206","0207","0208","0209","0210","0211","0212","0214","0215","0216","0217","0225","0226","0227","0228","0231"],
  "03": ["0300","0301","0302","0303","0306","0307","0308","0309","0310","0312","0320","0322","0325","0330","0331","0351"],
  "04": ["0400","0401","0402","0403","0404","0405","0406","0410","0411","0412","0413","0415","0416","0420","0421","0422","0423","0424","0425","0426","0427","0428","0429","0430","0431","0432","0435","0440","0441","0442","0443","0445","0446","0451","0452","0455","0457","0470","0471","0472","0473"],
  "05": ["0500","0501","0502","0503","0504","0505","0507","0508","0509","0510","0511","0512"],
  "06": ["0600","0601","0602","0605","0606","0610","0615","0616"],
  "07": ["0700","0701","0702","0703","0704","0711","0712","0713","0714","0715","0716","0717","0718","0719","0720","0721"],
  "09": ["0900","0901","0902","0903","0904","0905","0906","0907","0908","0909","0910","0911","0912","0913","0914","0920","0921","0922","0923","0930","0931","0932","0933"],
};

function construirCatalogo(): FefcoModel[] {
  const lista: FefcoModel[] = [];
  for (const grupo of Object.keys(CODIGOS)) {
    const fam = FAMILIAS[grupo];
    for (const code of CODIGOS[grupo]) {
      const n = NOTAVEIS[code];
      lista.push({
        code,
        nome: n?.nome ?? `Modelo FEFCO ${code}`,
        familia: fam.nome,
        grupo,
        descricao: n?.desc ?? fam.desc,
        arquetipo: n?.arq ?? fam.arq,
        visionHints: n?.hints,
      });
    }
  }
  return lista;
}

export const FEFCO_CATALOG: FefcoModel[] = construirCatalogo();

const POR_CODIGO = new Map(FEFCO_CATALOG.map((m) => [m.code, m]));

export function getFefco(code: FefcoCode): FefcoModel {
  return POR_CODIGO.get(code) ?? POR_CODIGO.get("0201") ?? FEFCO_CATALOG[0];
}

export function getArquetipo(code: FefcoCode): Arquetipo {
  return getFefco(code).arquetipo;
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

// Caixa de painéis (família 02) parametrizada pelo tamanho das abas inferior/superior.
// RSC (0201): abas iguais (metade da largura). Fundo automático (0215): aba inferior
// com sobreposição total (trava de fundo), aba superior normal.
function dielineCaixa(p: ParamsGeometria, abaInf: number, abaSup: number): Dieline {
  const d = compensar(p);
  const { Cc, Lc, Hc, abaCola } = d;

  // Eixo X: aba de cola | C | L | C | L
  const xs = [0, abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc];
  const larguraTotal = abaCola + 2 * Cc + 2 * Lc;
  // Eixo Y: aba inferior | corpo (Hc) | aba superior
  const alturaTotal = abaInf + Hc + abaSup;
  const yBottomFlap = 0;
  const yBody = abaInf;
  const yTopFlap = abaInf + Hc;

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

// FEFCO 0201 (RSC): abas iguais, encontram-se no centro.
function dieline0201(p: ParamsGeometria): Dieline {
  const { aba } = compensar(p);
  return dielineCaixa(p, aba, aba);
}

// Fundo automático (0215): aba de fundo com sobreposição total (trava),
// aba superior normal — visualmente o fundo fica reforçado.
function dielineFundoAutomatico(p: ParamsGeometria): Dieline {
  const { aba, Lc } = compensar(p);
  return dielineCaixa(p, Lc, aba);
}

// Fundo americano / trava automática (0216): topo com abas RSC (encontram no
// centro) e fundo com abas anguladas que se encaixam (crash-lock).
function dielineFundoAmericano(p: ParamsGeometria): Dieline {
  const { Cc, Lc, Hc, aba, abaCola } = compensar(p);
  const larguraTotal = abaCola + 2 * Cc + 2 * Lc;
  const bd = aba; // profundidade do fundo
  const yBody = bd;
  const yTop = bd + Hc;
  const alturaTotal = bd + Hc + aba;

  const cut: Line[] = [];
  const crease: Line[] = [];
  const panels: Rect[] = [];

  const panelXs = [abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc];
  const panelWs = [Cc, Lc, Cc, Lc];
  const labels = ["L", "W", "L", "W"];

  // bordas laterais do corpo + aba de cola
  cut.push({ x1: 0, y1: yBody, x2: 0, y2: yTop });
  cut.push({ x1: larguraTotal, y1: yBody, x2: larguraTotal, y2: yTop });
  panels.push({ x: 0, y: yBody, w: abaCola, h: Hc, label: "cola" });

  // vincos verticais entre painéis
  [abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc].forEach((x) =>
    crease.push({ x1: x, y1: yBody, x2: x, y2: yTop })
  );
  // dobras horizontais (fundo e topo)
  crease.push({ x1: abaCola, y1: yBody, x2: larguraTotal, y2: yBody });
  crease.push({ x1: abaCola, y1: yTop, x2: larguraTotal, y2: yTop });

  panelXs.forEach((px, i) => {
    const pw = panelWs[i];
    // topo: aba RSC (retangular, meia-largura)
    cut.push({ x1: px, y1: alturaTotal, x2: px + pw, y2: alturaTotal });
    cut.push({ x1: px, y1: yTop, x2: px, y2: alturaTotal });
    cut.push({ x1: px + pw, y1: yTop, x2: px + pw, y2: alturaTotal });
    panels.push({ x: px, y: yBody, w: pw, h: Hc, label: labels[i] });

    // fundo: aba angulada (trapézio) com vincos diagonais de trava
    const inset = pw * 0.16;
    cut.push({ x1: px, y1: yBody, x2: px + inset, y2: 0 });
    cut.push({ x1: px + inset, y1: 0, x2: px + pw - inset, y2: 0 });
    cut.push({ x1: px + pw - inset, y1: 0, x2: px + pw, y2: yBody });
    crease.push({ x1: px, y1: yBody, x2: px + pw / 2, y2: 0 });
    crease.push({ x1: px + pw, y1: yBody, x2: px + pw / 2, y2: 0 });
  });

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

// Desloca um desenho no eixo X (para compor mais de uma peça na mesma lâmina).
function deslocar(d: Dieline, dx: number): Dieline {
  return {
    largura: d.largura,
    altura: d.altura,
    cut: d.cut.map((l) => ({ x1: l.x1 + dx, y1: l.y1, x2: l.x2 + dx, y2: l.y2 })),
    crease: d.crease.map((l) => ({ x1: l.x1 + dx, y1: l.y1, x2: l.x2 + dx, y2: l.y2 })),
    panels: d.panels.map((r) => ({ ...r, x: r.x + dx })),
  };
}

// Caixa telescópica (0300): duas peças — fundo (bandeja) + tampa (bandeja
// um pouco maior e mais rasa) lado a lado na mesma lâmina.
function dielineTelescopica(p: ParamsGeometria): Dieline {
  const fundo = dielineBandeja(p);
  const tampa = dielineBandeja({
    ...p,
    C: p.C + 3,
    L: p.L + 3,
    H: Math.max(20, p.H * 0.4),
  });
  const gap = Math.max(p.C, 60) * 0.25;
  const tampaDesl = deslocar(tampa, fundo.largura + gap);
  return {
    largura: fundo.largura + gap + tampa.largura,
    altura: Math.max(fundo.altura, tampa.altura),
    cut: [...fundo.cut, ...tampaDesl.cut],
    crease: [...fundo.crease, ...tampaDesl.crease],
    panels: [...fundo.panels, ...tampaDesl.panels],
  };
}

// Monta um dieline a partir de painéis (retângulos) + linhas de dobra (vincos):
// cada aresta de painel que não coincide com um vinco vira corte (contorno).
function montar(panels: Rect[], folds: Line[]): Dieline {
  const eq = (a: number, b: number) => Math.abs(a - b) < 0.5;
  const igual = (a: Line, b: Line) =>
    (eq(a.x1, b.x1) && eq(a.y1, b.y1) && eq(a.x2, b.x2) && eq(a.y2, b.y2)) ||
    (eq(a.x1, b.x2) && eq(a.y1, b.y2) && eq(a.x2, b.x1) && eq(a.y2, b.y1));
  const cut: Line[] = [];
  for (const p of panels) {
    const arestas: Line[] = [
      { x1: p.x, y1: p.y, x2: p.x + p.w, y2: p.y },
      { x1: p.x + p.w, y1: p.y, x2: p.x + p.w, y2: p.y + p.h },
      { x1: p.x + p.w, y1: p.y + p.h, x2: p.x, y2: p.y + p.h },
      { x1: p.x, y1: p.y + p.h, x2: p.x, y2: p.y },
    ];
    for (const e of arestas) {
      if (folds.some((f) => igual(f, e))) continue;
      if (cut.some((c) => igual(c, e))) continue;
      cut.push(e);
    }
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of [...cut, ...folds]) {
    minX = Math.min(minX, l.x1, l.x2);
    minY = Math.min(minY, l.y1, l.y2);
    maxX = Math.max(maxX, l.x1, l.x2);
    maxY = Math.max(maxY, l.y1, l.y2);
  }
  const s = (l: Line): Line => ({ x1: l.x1 - minX, y1: l.y1 - minY, x2: l.x2 - minX, y2: l.y2 - minY });
  return {
    largura: maxX - minX,
    altura: maxY - minY,
    cut: cut.map(s),
    crease: folds.map(s),
    panels: panels.map((r) => ({ ...r, x: r.x - minX, y: r.y - minY })),
  };
}

// Caixa correio / mailer (uma peça): fundo + 4 paredes + abas laterais de trava
// + tampa que dobra por trás e encaixa na frente. Usada também para a maleta.
function dielineCorreio(p: ParamsGeometria): Dieline {
  const { Cc, Lc, Hc } = compensar(p);
  const ft = Hc * 0.55; // aba de encaixe (tuck)
  const x0 = Hc + 5;
  const y0 = Hc + ft + 5;

  const panels: Rect[] = [
    { x: x0, y: y0, w: Cc, h: Lc, label: "fundo" },
    { x: x0, y: y0 - Hc, w: Cc, h: Hc, label: "frente" },
    { x: x0, y: y0 - Hc - ft, w: Cc, h: ft, label: "" },
    { x: x0, y: y0 + Lc, w: Cc, h: Hc, label: "trás" },
    { x: x0, y: y0 + Lc + Hc, w: Cc, h: Lc, label: "tampa" },
    { x: x0, y: y0 + Lc + Hc + Lc, w: Cc, h: ft, label: "" },
    { x: x0 - Hc, y: y0, w: Hc, h: Lc, label: "lat" },
    { x: x0 + Cc, y: y0, w: Hc, h: Lc, label: "lat" },
    // abas de trava (orelhas) das paredes frente/trás
    { x: x0 - Hc, y: y0 - Hc, w: Hc, h: Hc, label: "" },
    { x: x0 + Cc, y: y0 - Hc, w: Hc, h: Hc, label: "" },
    { x: x0 - Hc, y: y0 + Lc, w: Hc, h: Hc, label: "" },
    { x: x0 + Cc, y: y0 + Lc, w: Hc, h: Hc, label: "" },
    // abas laterais da TAMPA (travam dentro da caixa) — marca do 0427
    { x: x0 - Hc, y: y0 + Lc + Hc, w: Hc, h: Lc, label: "" },
    { x: x0 + Cc, y: y0 + Lc + Hc, w: Hc, h: Lc, label: "" },
  ];

  const folds: Line[] = [
    { x1: x0, y1: y0, x2: x0 + Cc, y2: y0 }, // fundo-frente
    { x1: x0, y1: y0 + Lc, x2: x0 + Cc, y2: y0 + Lc }, // fundo-trás
    { x1: x0, y1: y0, x2: x0, y2: y0 + Lc }, // fundo-lat esq
    { x1: x0 + Cc, y1: y0, x2: x0 + Cc, y2: y0 + Lc }, // fundo-lat dir
    { x1: x0, y1: y0 - Hc, x2: x0 + Cc, y2: y0 - Hc }, // frente-tuck
    { x1: x0, y1: y0 + Lc + Hc, x2: x0 + Cc, y2: y0 + Lc + Hc }, // trás-tampa
    { x1: x0, y1: y0 + Lc + Hc + Lc, x2: x0 + Cc, y2: y0 + Lc + Hc + Lc }, // tampa-tuck
    { x1: x0, y1: y0 - Hc, x2: x0, y2: y0 }, // orelha frente esq
    { x1: x0 + Cc, y1: y0 - Hc, x2: x0 + Cc, y2: y0 }, // orelha frente dir
    { x1: x0, y1: y0 + Lc, x2: x0, y2: y0 + Lc + Hc }, // orelha trás esq
    { x1: x0 + Cc, y1: y0 + Lc, x2: x0 + Cc, y2: y0 + Lc + Hc }, // orelha trás dir
    { x1: x0, y1: y0 + Lc + Hc, x2: x0, y2: y0 + Lc + Hc + Lc }, // aba tampa esq
    { x1: x0 + Cc, y1: y0 + Lc + Hc, x2: x0 + Cc, y2: y0 + Lc + Hc + Lc }, // aba tampa dir
  ];

  return montar(panels, folds);
}

// Aproxima uma elipse (furo da alça) por segmentos de reta.
function elipse(cx: number, cy: number, rx: number, ry: number, n = 22): Line[] {
  const out: Line[] = [];
  let px = 0, py = 0;
  for (let k = 0; k <= n; k++) {
    const a = (2 * Math.PI * k) / n;
    const x = cx + rx * Math.cos(a);
    const y = cy + ry * Math.sin(a);
    if (k > 0) out.push({ x1: px, y1: py, x2: x, y2: y });
    px = x;
    py = y;
  }
  return out;
}

// Caixa maleta com alça (gable box): topo em duas águas com painel de alça
// (furo oval) e fundo automático com trava. Modelo para envio/transporte.
function dielineMaleta(p: ParamsGeometria): Dieline {
  const { Cc, Lc, Hc, aba, abaCola } = compensar(p);
  const larguraTotal = abaCola + 2 * Cc + 2 * Lc;
  const bd = aba; // profundidade do fundo (trava)
  const gableH = Lc * 0.85; // altura do painel de alça / gablé
  const yBody = bd;
  const yTop = bd + Hc;
  const topEnd = yTop + gableH;
  const alturaTotal = topEnd;

  const cut: Line[] = [];
  const crease: Line[] = [];
  const panels: Rect[] = [];

  const panelXs = [abaCola, abaCola + Cc, abaCola + Cc + Lc, abaCola + Cc + Lc + Cc];
  const panelWs = [Cc, Lc, Cc, Lc];
  const labels = ["L", "W", "L", "W"];

  cut.push({ x1: 0, y1: yBody, x2: 0, y2: yTop });
  cut.push({ x1: larguraTotal, y1: yBody, x2: larguraTotal, y2: yTop });
  panels.push({ x: 0, y: yBody, w: abaCola, h: Hc, label: "cola" });
  panelXs.forEach((x) => crease.push({ x1: x, y1: yBody, x2: x, y2: yTop }));
  crease.push({ x1: abaCola, y1: yBody, x2: larguraTotal, y2: yBody });
  crease.push({ x1: abaCola, y1: yTop, x2: larguraTotal, y2: yTop });

  panelXs.forEach((px, i) => {
    const pw = panelWs[i];
    panels.push({ x: px, y: yBody, w: pw, h: Hc, label: labels[i] });

    if (i % 2 === 0) {
      // painel de alça (nas faces L): retângulo alto com furo oval
      cut.push({ x1: px, y1: topEnd, x2: px + pw, y2: topEnd });
      cut.push({ x1: px, y1: yTop, x2: px, y2: topEnd });
      cut.push({ x1: px + pw, y1: yTop, x2: px + pw, y2: topEnd });
      elipse(px + pw / 2, yTop + gableH * 0.74, pw * 0.24, gableH * 0.09).forEach((l) => cut.push(l));
    } else {
      // gusset (nas faces W): dobras diagonais + vinco central (dobra para dentro)
      cut.push({ x1: px, y1: topEnd, x2: px + pw, y2: topEnd });
      cut.push({ x1: px, y1: yTop, x2: px, y2: topEnd });
      cut.push({ x1: px + pw, y1: yTop, x2: px + pw, y2: topEnd });
      crease.push({ x1: px, y1: yTop, x2: px + pw / 2, y2: topEnd });
      crease.push({ x1: px + pw, y1: yTop, x2: px + pw / 2, y2: topEnd });
      crease.push({ x1: px + pw / 2, y1: yTop, x2: px + pw / 2, y2: topEnd });
    }

    // fundo automático (trava) — abas anguladas
    const inset = pw * 0.16;
    cut.push({ x1: px, y1: yBody, x2: px + inset, y2: 0 });
    cut.push({ x1: px + inset, y1: 0, x2: px + pw - inset, y2: 0 });
    cut.push({ x1: px + pw - inset, y1: 0, x2: px + pw, y2: yBody });
    crease.push({ x1: px, y1: yBody, x2: px + pw / 2, y2: 0 });
    crease.push({ x1: px + pw, y1: yBody, x2: px + pw / 2, y2: 0 });
  });

  return { largura: larguraTotal, altura: alturaTotal, cut, crease, panels };
}

// Luva / corpo tubular (família 05): 4 painéis, sem abas (aberto nas pontas).
function dielineLuva(p: ParamsGeometria): Dieline {
  return dielineCaixa(p, 0.0001, 0.0001);
}

// Gera o desenho conforme o arquétipo do modelo FEFCO selecionado.
export function gerarDieline(code: FefcoCode, p: ParamsGeometria): Dieline {
  switch (getArquetipo(code)) {
    case "fundoAutomatico":
      return dielineFundoAutomatico(p);
    case "fundoAmericano":
      return dielineFundoAmericano(p);
    case "bandeja":
      return dielineBandeja(p);
    case "telescopica":
    case "rigida":
      return dielineTelescopica(p);
    case "luva":
      return dielineLuva(p);
    case "correio":
      return dielineCorreio(p);
    case "maleta":
      return dielineMaleta(p);
    case "rsc":
    default:
      return dieline0201(p);
  }
}
