// Especificações de ondas (flutes) de papelão ondulado.
// Espessura nominal em mm. O usuário pode sobrescrever com a medida real de paquímetro.

export type FluteId = "B" | "C" | "E" | "BC" | "KRAFT";

export interface Flute {
  id: FluteId;
  nome: string;
  descricao: string;
  // Faixa nominal de espessura (mm)
  espMin: number;
  espMax: number;
  // Espessura nominal padrão usada nos cálculos quando não há medição
  espNominal: number;
  // Gramatura aproximada (g/m²) para estimativa de custo de chapa
  gramatura: number;
  // Preço de referência da chapa (R$/m²) — ajustável
  precoChapaM2: number;
}

export const FLUTES: Record<FluteId, Flute> = {
  B: {
    id: "B",
    nome: "Onda B",
    descricao: "Onda baixa. Boa resistência ao esmagamento e ótima superfície de impressão.",
    espMin: 3.3,
    espMax: 3.8,
    espNominal: 3.5,
    gramatura: 540,
    precoChapaM2: 4.2,
  },
  C: {
    id: "C",
    nome: "Onda C",
    descricao: "Onda média, a mais usada em caixas de transporte (RSC). Bom empilhamento.",
    espMin: 4.2,
    espMax: 4.5,
    espNominal: 4.4,
    gramatura: 580,
    precoChapaM2: 4.6,
  },
  E: {
    id: "E",
    nome: "Onda E (microondulado)",
    descricao: "Micro-onda. Excelente para impressão de varejo e dobras finas.",
    espMin: 1.2,
    espMax: 1.5,
    espNominal: 1.4,
    gramatura: 430,
    precoChapaM2: 3.8,
  },
  BC: {
    id: "BC",
    nome: "Onda Dupla BC",
    descricao: "Parede dupla (B+C). Alta resistência para cargas pesadas e exportação.",
    espMin: 6.5,
    espMax: 7.5,
    espNominal: 7.0,
    gramatura: 1050,
    precoChapaM2: 7.9,
  },
  KRAFT: {
    id: "KRAFT",
    nome: "Papel Kraft",
    descricao: "Papel cartão / kraft sem onda. Para embalagens leves e expositores.",
    espMin: 0.3,
    espMax: 1.0,
    espNominal: 0.6,
    gramatura: 300,
    precoChapaM2: 2.6,
  },
};

export const FLUTE_LIST = Object.values(FLUTES);
