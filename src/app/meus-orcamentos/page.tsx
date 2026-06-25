"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, ArrowLeft, Plus, Trash2, FileText, FolderOpen } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/lib/auth/AuthContext";
import { listarOrcamentos, excluirOrcamento, OrcamentoSalvo } from "@/lib/orcamentos";
import { brl } from "@/lib/cartonagem/engine";

function MeusOrcamentos() {
  const { user } = useAuth();
  const router = useRouter();
  const [itens, setItens] = useState<OrcamentoSalvo[]>([]);
  const [carregando, setCarregando] = useState(true);

  async function recarregar() {
    if (!user) return;
    setCarregando(true);
    try {
      setItens(await listarOrcamentos(user.id));
    } catch {
      toast.error("Não foi possível carregar seus orçamentos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    recarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function excluir(o: OrcamentoSalvo) {
    if (!user) return;
    if (!confirm(`Excluir o orçamento "${o.nome}"?`)) return;
    await excluirOrcamento(user.id, o.id);
    setItens((l) => l.filter((x) => x.id !== o.id));
    toast.success("Orçamento excluído");
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <header className="bg-stone-900 text-stone-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Box className="w-6 h-6 text-amber-400" /> CartoDie
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/orcamento"
              className="text-sm text-stone-300 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao orçamento
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-amber-500" /> Meus orçamentos
          </h1>
          <Link
            href="/orcamento"
            className="flex items-center gap-2 rounded-lg bg-amber-500 text-stone-950 px-4 py-2.5 text-sm font-semibold hover:bg-amber-400 transition"
          >
            <Plus className="w-4 h-4" /> Novo orçamento
          </Link>
        </div>

        {carregando ? (
          <div className="py-20 text-center text-stone-400">Carregando...</div>
        ) : itens.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 mb-4">Você ainda não salvou nenhum orçamento.</p>
            <Link
              href="/orcamento"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 text-stone-950 px-4 py-2.5 text-sm font-semibold hover:bg-amber-400 transition"
            >
              <Plus className="w-4 h-4" /> Criar o primeiro
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {itens.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-xl border border-stone-200 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{o.nome}</p>
                  <p className="text-sm text-stone-500">
                    FEFCO {o.fefco} • {o.C}×{o.L}×{o.H}mm • onda {o.flute} • faca {o.tipoFaca}
                  </p>
                  <p className="text-xs text-stone-400">
                    {new Date(o.criadoEm).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-amber-700 whitespace-nowrap">
                    {brl(o.custoTotal)}
                  </span>
                  <button
                    onClick={() => router.push(`/orcamento?id=${o.id}`)}
                    className="rounded-lg bg-stone-800 text-white px-3 py-2 text-sm font-medium hover:bg-stone-900 transition"
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => excluir(o)}
                    className="rounded-lg border border-stone-300 p-2 text-stone-500 hover:text-red-600 hover:border-red-300 transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function MeusOrcamentosPage() {
  return (
    <RequireAuth>
      <MeusOrcamentos />
    </RequireAuth>
  );
}
