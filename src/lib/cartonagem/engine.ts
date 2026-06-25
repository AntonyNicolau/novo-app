// Motor de cálculo de cartonagem: metragem de lâmina, especificação da faca,
// compensação de kerf, margens de segurança e orçamento. Medidas em mm; custos em R$.

import { FefcoCode, Dieline, gerarDieline, compensar, Line } from "./fefco";
import { FLUTES, FluteId } from "./flutes";

export type TipoFaca = "plana" | "rotativa";

export interface OrcamentoInput {
  fefco: FefcoCode;
  C: number; // comprimento interno (mm)
  L: number; // largura interna (mm)
  H: number; // altura interna (mm)
  flute: FluteId;
  espessuraReal?: number; // medida de paquímetro (mm); se ausente usa nominal
  tipoFaca: TipoFaca;
  kerf: number; // largura do rastro do laser (mm), tipicamente 0.1–0.2
  abaCola?: number; // mm
  dielineImportada?: Dieline; // quando o cliente importa um DXF, usa este desenho
}

export interface EspecFaca {
  tipo: TipoFaca;
  // Madeira laminada
  espessuraMadeira: number; // 18 mm
  alturaLamina: number; // 23,8 mm (faca plana)
  espessuraLamina: number; // 0,71 mm aço alto carbono
  emborrachamento: boolean; // expulsor de borracha
  observacao: string;
}

export interface MetragemLamina {
  corteMm: number; // total de lâmina de corte
  vincoMm: number; // total de lâmina de vinco
  totalMm: number;
  totalMetros: number;
}

export interface MargensSeguranca {
  sangriaImpressao: number; // >= 10 mm
  distanciaVinco: number; // >= 5 mm de info aos vincos
  avisos: string[];
}

export interface CustoDetalhado {
  madeira: number;
  laminaCorte: number;
  laminaVinco: number;
  emborrachamento: number;
  estrutura: number; // estrutura cilíndrica (apenas faca rotativa); 0 na plana
  total: number; // custo total da faca (somente ferramental)
}

export interface OrcamentoResultado {
  input: OrcamentoInput;
  espessura: number;
  espessuraFonte: "paquímetro" | "nominal";
  dims: ReturnType<typeof compensar>;
  dieline: Dieline;
  blank: { largura: number; altura: number; areaM2: number };
  metragem: MetragemLamina;
  faca: EspecFaca;
  margens: MargensSeguranca;
  custo: CustoDetalhado;
  geradoEm: string;
}

// Tabela de preços de referência (ajustável). Valores em R$.
export const PRECOS = {
  madeiraLaminadaM2: 320, // R$/m² de madeira laminada 18mm cortada a laser (referência)
  laminaCorteMetro: 120, // R$/m de lâmina de aço (valor real informado)
  laminaVincoMetro: 120, // R$/m de lâmina de aço (mesma régua, valor real informado)
  emborrachamentoM2: 180, // R$/m² de emborrachamento técnico (expulsor) (referência)
  baseRotativa: 1800, // R$ estrutura cilíndrica base da faca rotativa (referência)
};

function comprimentoLinhas(linhas: Line[]): number {
  return linhas.reduce((acc, l) => acc + Math.hypot(l.x2 - l.x1, l.y2 - l.y1), 0);
}

export function especificarFaca(tipo: TipoFaca): EspecFaca {
  if (tipo === "rotativa") {
    return {
      tipo,
      espessuraMadeira: 18,
      alturaLamina: 25.0, // lâminas curvas para cilindro
      espessuraLamina: 0.71,
      emborrachamento: true,
      observacao:
        "Estrutura cilíndrica para corte contínuo em máquinas automáticas de alta velocidade.",
    };
  }
  return {
    tipo,
    espessuraMadeira: 18,
    alturaLamina: 23.8,
    espessuraLamina: 0.71,
    emborrachamento: true,
    observacao:
      "Madeira laminada 18mm + lâminas de 23,8mm. Indicada para cortes complexos e volumes menores.",
  };
}

export function calcularMargens(input: OrcamentoInput): MargensSeguranca {
  const avisos: string[] = [];
  if (!input.espessuraReal) {
    avisos.push(
      "Espessura não medida: usando valor nominal da onda. Meça com paquímetro para garantir o volume interno."
    );
  }
  if (input.kerf < 0.1 || input.kerf > 0.2) {
    avisos.push(
      `Kerf de ${input.kerf}mm fora da faixa usual (0,1–0,2mm). Ajuste para as lâminas ficarem firmes na madeira.`
    );
  }
  avisos.push("Mantenha 10mm de sangria nas áreas impressas e nenhuma informação a menos de 5mm dos vincos.");
  return { sangriaImpressao: 10, distanciaVinco: 5, avisos };
}

export function calcular(input: OrcamentoInput): OrcamentoResultado {
  const flute = FLUTES[input.flute];
  const espessura = input.espessuraReal && input.espessuraReal > 0 ? input.espessuraReal : flute.espNominal;
  const espessuraFonte = input.espessuraReal && input.espessuraReal > 0 ? "paquímetro" : "nominal";

  const dims = compensar({ C: input.C, L: input.L, H: input.H, t: espessura, abaCola: input.abaCola });
  // Se houver um DXF importado, o orçamento usa o desenho do próprio cliente.
  const dieline =
    input.dielineImportada ??
    gerarDieline(input.fefco, {
      C: input.C,
      L: input.L,
      H: input.H,
      t: espessura,
      abaCola: input.abaCola,
    });

  // Metragem de lâmina
  const corteMm = comprimentoLinhas(dieline.cut);
  const vincoMm = comprimentoLinhas(dieline.crease);
  const totalMm = corteMm + vincoMm;
  const metragem: MetragemLamina = {
    corteMm,
    vincoMm,
    totalMm,
    totalMetros: totalMm / 1000,
  };

  // Área da chapa (blank) em m²
  const areaM2 = (dieline.largura * dieline.altura) / 1_000_000;
  const blank = { largura: dieline.largura, altura: dieline.altura, areaM2 };

  const faca = especificarFaca(input.tipoFaca);

  // Custos da faca (ferramenta) — paga uma vez
  // Madeira: área do blank + 40mm de moldura em volta
  const moldura = 0.04;
  const areaMadeira =
    ((dieline.largura / 1000 + moldura) * (dieline.altura / 1000 + moldura));
  const madeira = areaMadeira * PRECOS.madeiraLaminadaM2;
  const laminaCorte = metragem.corteMm / 1000 * PRECOS.laminaCorteMetro;
  const laminaVinco = metragem.vincoMm / 1000 * PRECOS.laminaVincoMetro;
  // Emborrachamento ~30% da área da madeira (faixas de borracha junto às lâminas)
  const emborrachamento = areaMadeira * 0.3 * PRECOS.emborrachamentoM2;
  // Somente ferramental (sem mão de obra). A estrutura cilíndrica entra só na rotativa.
  const estrutura = input.tipoFaca === "rotativa" ? PRECOS.baseRotativa : 0;
  const facaTotal = madeira + laminaCorte + laminaVinco + emborrachamento + estrutura;

  const custo: CustoDetalhado = {
    madeira,
    laminaCorte,
    laminaVinco,
    emborrachamento,
    estrutura,
    total: facaTotal,
  };

  return {
    input,
    espessura,
    espessuraFonte,
    dims,
    dieline,
    blank,
    metragem,
    faca,
    margens: calcularMargens(input),
    custo,
    geradoEm: new Date().toISOString(),
  };
}

export function brl(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
