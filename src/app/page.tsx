import Link from "next/link";
import {
  Box,
  Camera,
  Ruler,
  Scissors,
  Layers,
  FileDown,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    titulo: "IA Vision + FEFCO",
    texto:
      "Envie a foto de uma caixa e a IA sugere a estrutura FEFCO (0201, 0427, 0215, 0300). Aceita também vetores DXF, AI e PDF.",
  },
  {
    icon: Ruler,
    titulo: "Compensação de vinco",
    texto:
      "Acréscimos lineares automáticos pela espessura real (paquímetro) para dobras e volume interno perfeitos.",
  },
  {
    icon: Scissors,
    titulo: "Faca plana ou rotativa",
    texto:
      "Madeira laminada 18mm, lâminas de aço 0,71mm, emborrachamento e compensação de kerf do laser inclusos.",
  },
  {
    icon: Layers,
    titulo: "Metragem de lâmina",
    texto:
      "Cálculo do total de lâmina de corte e vinco em metros, com margens de segurança de sangria e vincos.",
  },
  {
    icon: Box,
    titulo: "Preview 3D em tempo real",
    texto:
      "Veja a caixa dobrada a partir do desenho da faca e valide o modelo antes de fechar o orçamento.",
  },
  {
    icon: FileDown,
    titulo: "DXF + Proposta em PDF",
    texto:
      "Exporte DXF pronto para corte a laser e dobra automática, e gere a proposta detalhada em segundos.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Box className="w-7 h-7 text-amber-400" /> CartoDie
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-stone-300 hover:text-white px-3 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg bg-amber-500 text-stone-950 px-5 py-2.5 text-sm font-semibold hover:bg-amber-400 transition"
          >
            Criar conta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-300 mb-6">
          <ShieldCheck className="w-3.5 h-3.5" /> Plataforma Web-to-Die • Cloudflare
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Orçamento instantâneo de
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            cartonagem e papelão ondulado
          </span>
        </h1>
        <p className="text-lg text-stone-400 mt-6 max-w-2xl mx-auto">
          Do reconhecimento da caixa por IA ao DXF industrial: compensação de vinco, metragem de
          lâmina, faca plana ou rotativa, preview 3D e proposta em PDF — seguindo os padrões da
          indústria.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/orcamento"
            className="rounded-lg bg-amber-500 text-stone-950 px-8 py-4 font-semibold hover:bg-amber-400 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" /> Criar orçamento agora
          </Link>
          <a
            href="#recursos"
            className="rounded-lg border border-stone-700 px-8 py-4 font-semibold hover:bg-stone-900 transition"
          >
            Ver recursos
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-stone-500 mt-8">
          <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4" /> Cálculo no navegador</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Hospedagem Cloudflare</span>
          <span className="flex items-center gap-1.5"><FileDown className="w-4 h-4" /> Proposta em &lt; 10s</span>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 hover:border-amber-500/40 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.titulo}</h3>
              <p className="text-sm text-stone-400">{f.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-12 text-center text-stone-950">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Pronto para orçar sua próxima caixa?</h2>
          <p className="text-lg opacity-90 mb-8">
            Informe C × L × H em mm, escolha a onda e gere faca, DXF e proposta em segundos.
          </p>
          <Link
            href="/orcamento"
            className="inline-flex items-center gap-2 rounded-lg bg-stone-950 text-amber-400 px-8 py-4 font-semibold hover:bg-stone-900 transition"
          >
            <Box className="w-5 h-5" /> Começar
          </Link>
        </div>
      </section>

      <footer className="container mx-auto px-4 py-10 text-center text-sm text-stone-600 border-t border-stone-900">
        © {new Date().getFullYear()} CartoDie — Plataforma de cartonagem e papelão ondulado.
      </footer>
    </div>
  );
}
