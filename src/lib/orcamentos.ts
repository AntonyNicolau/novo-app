// Camada de dados dos orçamentos salvos. Usa Supabase quando configurado
// (com RLS: cada cliente vê só os seus); caso contrário, modo demonstração
// local (localStorage) para permitir testar o fluxo sem backend.

import { supabase } from "./auth/supabaseClient";
import { FefcoCode } from "./cartonagem/fefco";
import { FluteId } from "./cartonagem/flutes";
import { TipoFaca } from "./cartonagem/engine";

export interface OrcamentoSalvo {
  id: string;
  nome: string;
  fefco: FefcoCode;
  C: number;
  L: number;
  H: number;
  flute: FluteId;
  espReal: number | null;
  tipoFaca: TipoFaca;
  kerf: number;
  custoTotal: number;
  criadoEm: string;
}

export type NovoOrcamento = Omit<OrcamentoSalvo, "id" | "criadoEm">;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(r: any): OrcamentoSalvo {
  return {
    id: r.id,
    nome: r.nome,
    fefco: r.fefco,
    C: Number(r.c),
    L: Number(r.l),
    H: Number(r.h),
    flute: r.flute,
    espReal: r.esp_real != null ? Number(r.esp_real) : null,
    tipoFaca: r.tipo_faca,
    kerf: Number(r.kerf),
    custoTotal: Number(r.custo_total),
    criadoEm: r.criado_em,
  };
}

// -------------------- demo (localStorage) --------------------
const lsKey = (userId: string) => `cartodie_orcamentos_${userId}`;

function lsRead(userId: string): OrcamentoSalvo[] {
  try {
    return JSON.parse(localStorage.getItem(lsKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function lsWrite(userId: string, list: OrcamentoSalvo[]) {
  localStorage.setItem(lsKey(userId), JSON.stringify(list));
}

// -------------------- API pública --------------------
export async function listarOrcamentos(userId: string): Promise<OrcamentoSalvo[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("orcamentos")
      .select("*")
      .order("criado_em", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(fromRow);
  }
  return lsRead(userId).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export async function obterOrcamento(
  userId: string,
  id: string
): Promise<OrcamentoSalvo | null> {
  if (supabase) {
    const { data, error } = await supabase.from("orcamentos").select("*").eq("id", id).single();
    if (error) return null;
    return data ? fromRow(data) : null;
  }
  return lsRead(userId).find((o) => o.id === id) ?? null;
}

export async function salvarOrcamento(
  userId: string,
  data: NovoOrcamento
): Promise<{ id?: string; error?: string }> {
  if (supabase) {
    const { data: row, error } = await supabase
      .from("orcamentos")
      .insert({
        user_id: userId,
        nome: data.nome,
        fefco: data.fefco,
        c: data.C,
        l: data.L,
        h: data.H,
        flute: data.flute,
        esp_real: data.espReal,
        tipo_faca: data.tipoFaca,
        kerf: data.kerf,
        custo_total: data.custoTotal,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    return { id: row.id };
  }
  const novo: OrcamentoSalvo = {
    ...data,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };
  const list = lsRead(userId);
  list.push(novo);
  lsWrite(userId, list);
  return { id: novo.id };
}

export async function excluirOrcamento(userId: string, id: string): Promise<void> {
  if (supabase) {
    await supabase.from("orcamentos").delete().eq("id", id);
    return;
  }
  lsWrite(
    userId,
    lsRead(userId).filter((o) => o.id !== id)
  );
}
