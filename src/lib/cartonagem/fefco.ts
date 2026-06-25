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
  | "rigida";

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
  "0300": { nome: "Telescópica tampa + fundo", desc: "Fundo (bandeja) e tampa telescópica que encaixa por fora.", hints: ["tampa separada", "telescópica"] },
  "0306": { nome: "Bandeja + tampa telescópica parcial", desc: "Tampa cobre parte da altura do fundo." },
  "0310": { nome: "Tampa telescópica total", desc: "Tampa cobre toda a altura do fundo." },
  "0427": { nome: "Bandeja fundo automático (PDV)", desc: "Bandeja/expositor de uma folha com travas laterais, montagem rápida. Comum em PDV.", arq: "bandeja", hints: ["bandeja", "expositor", "pdv"] },
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

// Luva / corpo tubular (família 05): 4 painéis, sem abas (aberto nas pontas).
function dielineLuva(p: ParamsGeometria): Dieline {
  return dielineCaixa(p, 0.0001, 0.0001);
}

// Gera o desenho conforme o arquétipo do modelo FEFCO selecionado.
export function gerarDieline(code: FefcoCode, p: ParamsGeometria): Dieline {
  switch (getArquetipo(code)) {
    case "fundoAutomatico":
      return dielineFundoAutomatico(p);
    case "bandeja":
      return dielineBandeja(p);
    case "telescopica":
    case "rigida":
      return dielineTelescopica(p);
    case "luva":
      return dielineLuva(p);
    case "rsc":
    default:
      return dieline0201(p);
  }
}
