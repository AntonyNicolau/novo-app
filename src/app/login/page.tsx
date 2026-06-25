"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { DemoBadge } from "@/components/auth/DemoBadge";

export default function LoginPage() {
  const { signIn, user, loading, mode } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/orcamento");
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const { error } = await signIn(email, senha);
    setEnviando(false);
    if (error) setErro(error);
    else router.replace("/orcamento");
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
        <Box className="w-7 h-7 text-amber-400" /> CartoDie
      </Link>

      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-7">
        <h1 className="text-xl font-bold mb-1">Entrar</h1>
        <p className="text-sm text-stone-400 mb-6">Acesse a plataforma de orçamento.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="E-mail">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-sm focus:border-amber-500 outline-none"
              placeholder="voce@empresa.com.br"
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-sm focus:border-amber-500 outline-none"
              placeholder="••••••••"
            />
          </Field>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-amber-500 text-stone-950 font-semibold py-2.5 hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />} Entrar
          </button>
        </form>

        <p className="text-sm text-stone-400 mt-6 text-center">
          Não tem conta?{" "}
          <Link href="/cadastro" className="text-amber-400 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>

      {mode === "demo" && <DemoBadge />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-300 mb-1">{label}</span>
      {children}
    </label>
  );
}
