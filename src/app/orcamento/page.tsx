"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Box,
  Upload,
  Camera,
  FileDown,
  FileText,
  Ruler,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Layers,
  Scissors,
  Save,
  FolderOpen,
} from "lucide-react";
import { FEFCO_CATALOG, FefcoCode, getArquetipo, Dieline } from "@/lib/cartonagem/fefco";
import { FLUTE_LIST, FluteId, FLUTES } from "@/lib/cartonagem/flutes";
import { calcular, brl, TipoFaca } from "@/lib/cartonagem/engine";
import { gerarDXF, baixarTexto } from "@/lib/cartonagem/dxf";
import { lerDXF } from "@/lib/cartonagem/dxfImport";
import { DielinePreview } from "@/components/cartonagem/DielinePreview";
import { Box3D } from "@/components/cartonagem/Box3D";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/lib/auth/AuthContext";
import { salvarOrcamento, obterOrcamento } from "@/lib/orcamentos";

const fluteCor: Record<FluteId, string> = {
  B: "#c8a06a",
  C: "#c19a5b",
  E: "#d8b483",
  BC: "#a8794a",
  KRAFT: "#d9c39a",
};

function OrcamentoTool() {
  const [fefco, setFefco] = useState<FefcoCode>("0201");
  const [C, setC] = useState(300);
  const [L, setL] = useState(200);
  const [H, setH] = useState(150);
  const [flute, setFlute] = useState<FluteId>("C");
  const [espReal, setEspReal] = useState<string>("");
  const [tipoFaca, setTipoFaca] = useState<TipoFaca>("plana");
  const [kerf, setKerf] = useState(0.15);
  const [visionLoading, setVisionLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [dxf, setDxf] = useState<{ dieline: Dieline; nome: string } | null>(null);
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const vetorRef = useRef<HTMLInputElement>(null);

  // Carrega um orçamento salvo quando a URL traz ?id=...
  useEffect(() => {
    if (!user) return;
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;
    obterOrcamento(user.id, id).then((o) => {
      if (!o) return;
      setFefco(o.fefco);
      setC(o.C);
      setL(o.L);
      setH(o.H);
      setFlute(o.flute);
      setEspReal(o.espReal != null ? String(o.espReal) : "");
      setTipoFaca(o.tipoFaca);
      setKerf(o.kerf);
      setNome(o.nome);
      toast.success(`Orçamento "${o.nome}" carregado`);
    });
  }, [user]);

  const resultado = useMemo(
    () =>
      calcular({
        fefco,
        C,
        L,
        H,
        flute,
        espessuraReal: espReal ? Number(espReal) : undefined,
        tipoFaca,
        kerf,
        dielineImportada: dxf?.dieline,
      }),
    [fefco, C, L, H, flute, espReal, tipoFaca, kerf, dxf]
  );

  const modelo = FEFCO_CATALOG.find((f) => f.code === fefco)!;

  async function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVisionLoading(true);
    try {
      const b64 = await new Promise<string>((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result as string);
        r.readAsDataURL(file);
      });
      const resp = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });
      const data = await resp.json();
      if (data?.fefco) {
        setFefco(data.fefco);
        toast.success(
          `IA sugeriu FEFCO ${data.fefco} (${Math.round((data.confianca ?? 0) * 100)}%)`,
          { description: data.motivo }
        );
      }
    } catch {
      toast.error("Não foi possível analisar a foto agora.");
    } finally {
      setVisionLoading(false);
      e.target.value = "";
    }
  }

  async function onVetor(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext !== "dxf") {
      toast.info(`"${file.name}" recebido`, {
        description: "Leitura de desenho disponível para DXF. AI/PDF: em breve.",
      });
      return;
    }
    try {
      const texto = await file.text();
      const { dieline, entidades, unidade } = lerDXF(texto);
      setDxf({ dieline, nome: file.name });
      if (!nome) setNome(file.name.replace(/\.dxf$/i, ""));
      toast.success(`DXF "${file.name}" carregado`, {
        description: `${entidades} entidades • unidade ${unidade} • desenho do cliente no preview.`,
      });
    } catch (err) {
      toast.error("Não foi possível ler o DXF", {
        description: err instanceof Error ? err.message : "Arquivo inválido.",
      });
    }
  }

  function removerDXF() {
    setDxf(null);
    toast.message("Voltou para a estrutura FEFCO selecionada.");
  }

  function exportarDXF() {
    const conteudo = gerarDXF(resultado.dieline, { kerf, fefco });
    baixarTexto(dxf ? `faca-${dxf.nome}` : `faca-${fefco}-${C}x${L}x${H}.dxf`, conteudo);
    toast.success("DXF industrial exportado", {
      description: "Camadas CORTE e VINCO separadas, em milímetros.",
    });
  }

  function gerarProposta() {
    toast.success("Proposta pronta", { description: "Use 'Salvar como PDF' na janela de impressão." });
    setTimeout(() => window.print(), 250);
  }

  async function salvar() {
    if (!user) return;
    const titulo = nome.trim() || `${fefco} ${C}×${L}×${H}mm`;
    setSalvando(true);
    const { error } = await salvarOrcamento(user.id, {
      nome: titulo,
      fefco,
      C,
      L,
      H,
      flute,
      espReal: espReal ? Number(espReal) : null,
      tipoFaca,
      kerf,
      custoTotal: resultado.custo.total,
    });
    setSalvando(false);
    if (error) toast.error("Não foi possível salvar.", { description: error });
    else toast.success(`Orçamento "${titulo}" salvo`, { description: "Disponível em Meus orçamentos." });
  }

  const c = resultado.custo;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">
      {/* Cabeçalho */}
      <header className="bg-stone-900 text-stone-100 print:hidden">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Box className="w-6 h-6 text-amber-400" /> CartoDie
          </Link>
          <div className="flex items-center gap-5">
            <Link
              href="/meus-orcamentos"
              className="text-sm text-stone-300 hover:text-white flex items-center gap-1"
            >
              <FolderOpen className="w-4 h-4" /> Meus orçamentos
            </Link>
            <Link href="/" className="text-sm text-stone-300 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Início
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 grid lg:grid-cols-[420px_1fr] gap-6 print:block">
        {/* ----------------- Coluna de entrada ----------------- */}
        <div className="space-y-5 print:hidden">
          {/* IA Vision / Upload */}
          <section className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" /> 1. Entrada e Reconhecimento
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={visionLoading}
                className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-stone-300 p-4 text-sm hover:border-amber-400 hover:bg-amber-50 transition"
              >
                <Camera className="w-5 h-5 text-amber-600" />
                {visionLoading ? "Analisando..." : "Foto da caixa (IA)"}
              </button>
              <button
                onClick={() => vetorRef.current?.click()}
                className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-stone-300 p-4 text-sm hover:border-amber-400 hover:bg-amber-50 transition"
              >
                <Upload className="w-5 h-5 text-stone-600" />
                Vetor DXF/AI/PDF
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFoto} />
            <input ref={vetorRef} type="file" accept=".dxf,.ai,.pdf" hidden onChange={onVetor} />

            <label className="block text-sm font-medium mt-4 mb-1">Estrutura FEFCO</label>
            <select
              value={fefco}
              onChange={(e) => setFefco(e.target.value as FefcoCode)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white"
            >
              {FEFCO_CATALOG.map((f) => (
                <option key={f.code} value={f.code}>
                  {f.code} — {f.nome}
                </option>
              ))}
            </select>
            <p className="text-xs text-stone-500 mt-2">{modelo.descricao}</p>
          </section>

          {/* Medidas */}
          <section className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <Ruler className="w-4 h-4 text-amber-500" /> 2. Medidas internas (mm)
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: "Comprimento (C)", v: C, set: setC },
                { l: "Largura (L)", v: L, set: setL },
                { l: "Altura (H)", v: H, set: setH },
              ].map((f) => (
                <div key={f.l}>
                  <label className="block text-xs font-medium mb-1">{f.l}</label>
                  <input
                    type="number"
                    min={1}
                    value={f.v}
                    onChange={(e) => f.set(Number(e.target.value))}
                    className="w-full rounded-lg border border-stone-300 px-2 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            <label className="block text-sm font-medium mt-4 mb-1">Material / Onda</label>
            <select
              value={flute}
              onChange={(e) => setFlute(e.target.value as FluteId)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white"
            >
              {FLUTE_LIST.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome} ({f.espMin}–{f.espMax}mm)
                </option>
              ))}
            </select>

            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Espessura real (paquímetro)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={`nominal ${FLUTES[flute].espNominal}mm`}
                value={espReal}
                onChange={(e) => setEspReal(e.target.value)}
                className="w-full rounded-lg border border-amber-300 px-2 py-2 text-sm bg-white"
              />
              <p className="text-[11px] text-amber-700 mt-1">
                Meça com paquímetro para garantir o volume interno e a compensação dos vincos.
              </p>
            </div>
          </section>

          {/* Faca */}
          <section className="bg-white rounded-xl border border-stone-200 p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-3">
              <Scissors className="w-4 h-4 text-amber-500" /> 3. Especificação da faca
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(["plana", "rotativa"] as TipoFaca[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoFaca(t)}
                  className={`rounded-lg border px-3 py-2 text-sm capitalize transition ${
                    tipoFaca === t
                      ? "border-amber-500 bg-amber-50 font-semibold"
                      : "border-stone-300 hover:border-amber-300"
                  }`}
                >
                  Faca {t}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Kerf do laser (mm)</label>
              <input
                type="number"
                step="0.05"
                value={kerf}
                onChange={(e) => setKerf(Number(e.target.value))}
                className="w-full rounded-lg border border-stone-300 px-2 py-2 text-sm"
              />
            </div>
            <p className="text-[11px] text-stone-500 mt-2">{resultado.faca.observacao}</p>
          </section>
        </div>

        {/* ----------------- Coluna de saída ----------------- */}
        <div className="space-y-6">
          {/* Previews */}
          <div className="grid md:grid-cols-2 gap-6 print:grid-cols-2">
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-500" /> Desenho da faca (dieline)
                </h3>
                {dxf && (
                  <span className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                    DXF: {dxf.nome}
                    <button
                      onClick={removerDXF}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                      title="Remover e voltar ao FEFCO"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
              <DielinePreview dieline={resultado.dieline} className="w-full h-64" />
              <div className="flex gap-4 text-xs mt-2 text-stone-500">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-red-600" /> Corte
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-blue-600" /> Vinco
                </span>
                <span className="ml-auto">
                  Lâmina: {resultado.blank.largura.toFixed(0)} × {resultado.blank.altura.toFixed(0)} mm
                </span>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-amber-500" /> Preview 3D (caixa dobrada)
              </h3>
              <Box3D
                C={C}
                L={L}
                H={H}
                fluteColor={fluteCor[flute]}
                arquetipo={getArquetipo(fefco)}
                className="w-full h-64"
              />
              <p className="text-[11px] text-center text-stone-400">
                {dxf
                  ? "Arquivo importado: 3D aproximado pelas medidas C×L×H informadas."
                  : "Arraste para girar • duplo clique alterna auto-rotação"}
              </p>
            </div>
          </div>

          {/* Resultados técnicos */}
          <div className="grid md:grid-cols-3 gap-4 print:grid-cols-3">
            <Stat titulo="Metragem de lâmina">
              <Row k="Corte" v={`${(resultado.metragem.corteMm / 1000).toFixed(2)} m`} />
              <Row k="Vinco" v={`${(resultado.metragem.vincoMm / 1000).toFixed(2)} m`} />
              <Row k="Total" v={`${resultado.metragem.totalMetros.toFixed(2)} m`} bold />
            </Stat>
            <Stat titulo="Compensação de vinco">
              <Row k="C compensado" v={`${resultado.dims.Cc.toFixed(1)} mm`} />
              <Row k="L compensado" v={`${resultado.dims.Lc.toFixed(1)} mm`} />
              <Row k="H compensado" v={`${resultado.dims.Hc.toFixed(1)} mm`} />
              <Row k="Espessura" v={`${resultado.espessura}mm (${resultado.espessuraFonte})`} />
            </Stat>
            <Stat titulo="Faca / Ferramenta">
              <Row k="Madeira" v={`${resultado.faca.espessuraMadeira}mm`} />
              <Row k="Altura lâmina" v={`${resultado.faca.alturaLamina}mm`} />
              <Row k="Esp. lâmina" v={`${resultado.faca.espessuraLamina}mm`} />
              <Row k="Emborrachamento" v={resultado.faca.emborrachamento ? "Sim" : "Não"} />
            </Stat>
          </div>

          {/* Margens de segurança */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm print:border-stone-300">
            <h3 className="font-semibold flex items-center gap-2 mb-2 text-amber-800">
              <AlertTriangle className="w-4 h-4" /> Margens de segurança
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-amber-800">
              {resultado.margens.avisos.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Orçamento */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Orçamento da faca</h3>
              <span className="text-xs text-stone-400">
                {modelo.code} • faca {resultado.faca.tipo}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <Row k="Madeira laminada 18mm" v={brl(c.madeira)} />
              <Row k="Lâmina de corte" v={brl(c.laminaCorte)} />
              <Row k="Lâmina de vinco" v={brl(c.laminaVinco)} />
              <Row k="Emborrachamento técnico" v={brl(c.emborrachamento)} />
              {c.estrutura > 0 && <Row k="Estrutura cilíndrica" v={brl(c.estrutura)} />}
            </div>
            <div className="border-t border-stone-200 mt-4 pt-4 flex items-center justify-between">
              <span className="font-bold text-lg">Total da faca</span>
              <span className="font-bold text-2xl text-amber-700">{brl(c.total)}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-5 print:hidden">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={`Nome do orçamento (ex.: ${fefco} ${C}×${L}×${H})`}
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2.5 text-sm"
              />
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
            <div className="flex flex-wrap gap-3 mt-3 print:hidden">
              <button
                onClick={gerarProposta}
                className="flex items-center gap-2 rounded-lg bg-amber-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-amber-700 transition"
              >
                <FileText className="w-4 h-4" /> Gerar Proposta (PDF)
              </button>
              <button
                onClick={exportarDXF}
                className="flex items-center gap-2 rounded-lg bg-stone-800 text-white px-4 py-2.5 text-sm font-semibold hover:bg-stone-900 transition"
              >
                <FileDown className="w-4 h-4" /> Exportar DXF industrial
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-3">
              Valores de referência com tabela de preços ajustável. Proposta gerada instantaneamente.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Stat({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-2">{titulo}</h3>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-500">{k}</span>
      <span className={bold ? "font-semibold" : ""}>{v}</span>
    </div>
  );
}

export default function OrcamentoPage() {
  return (
    <RequireAuth>
      <OrcamentoTool />
    </RequireAuth>
  );
}
