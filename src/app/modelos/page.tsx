"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, ArrowLeft, Search, LayoutGrid } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserMenu } from "@/components/auth/UserMenu";
import { FEFCO_CATALOG, gerarDieline } from "@/lib/cartonagem/fefco";
import { DielinePreview } from "@/components/cartonagem/DielinePreview";

// medidas padrão só para a miniatura do desenho
const DIM = { C: 300, L: 200, H: 150, t: 4 };

function Modelos() {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = q
      ? FEFCO_CATALOG.filter(
          (m) => m.code.includes(q) || m.nome.toLowerCase().includes(q) || m.familia.toLowerCase().includes(q)
        )
      : FEFCO_CATALOG;
    // agrupa por grupo (02..09)
    const grupos = new Map<string, typeof FEFCO_CATALOG>();
    for (const m of lista) {
      if (!grupos.has(m.grupo)) grupos.set(m.grupo, []);
      grupos.get(m.grupo)!.push(m);
    }
    return [...grupos.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [busca]);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      <header className="bg-stone-900 text-stone-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Box className="w-6 h-6 text-amber-400" /> CartoDie
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/orcamento" className="text-sm text-stone-300 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Orçamento
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-amber-500" /> Modelos de caixa (FEFCO)
          </h1>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código, nome ou família..."
              className="w-full rounded-lg border border-stone-300 pl-9 pr-3 py-2.5 text-sm"
            />
          </div>
        </div>

        <p className="text-sm text-stone-500 mb-6">
          {FEFCO_CATALOG.length} modelos no padrão FEFCO. Clique em um modelo para abrir a central de
          orçamento já configurada nele.
        </p>

        {filtrados.map(([grupo, modelos]) => (
          <section key={grupo} className="mb-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 mb-3">
              {modelos[0].familia}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {modelos.map((m) => (
                <button
                  key={m.code}
                  onClick={() => router.push(`/orcamento?fefco=${m.code}`)}
                  className="group bg-white rounded-xl border border-stone-200 p-3 text-left hover:border-amber-400 hover:shadow-md transition"
                  title={m.descricao}
                >
                  <div className="bg-stone-50 rounded-lg overflow-hidden mb-2 aspect-[4/3] flex items-center justify-center">
                    <DielinePreview dieline={gerarDieline(m.code, DIM)} className="w-full h-full" />
                  </div>
                  <div className="text-amber-700 font-bold text-sm">FEFCO {m.code}</div>
                  <div className="text-xs text-stone-600 line-clamp-2 leading-tight">{m.nome}</div>
                </button>
              ))}
            </div>
          </section>
        ))}

        {filtrados.length === 0 && (
          <div className="text-center text-stone-400 py-16">Nenhum modelo encontrado para “{busca}”.</div>
        )}
      </main>
    </div>
  );
}

export default function ModelosPage() {
  return (
    <RequireAuth>
      <Modelos />
    </RequireAuth>
  );
}
