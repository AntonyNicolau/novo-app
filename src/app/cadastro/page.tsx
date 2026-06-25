"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { DemoBadge } from "@/components/auth/DemoBadge";

export default function CadastroPage() {
  const { signUp, user, loading, mode } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/orcamento");
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (senha.length < 6) {
      setErro("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    const { error, needsConfirmation } = await signUp(email, senha, { nome, empresa });
    setEnviando(false);
    if (error) {
      setErro(error);
      return;
    }
    if (needsConfirmation) {
      setConfirmar(true);
      return;
    }
    router.replace("/orcamento");
  }

  if (confirmar) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-4 text-center">
        <CheckCircle2 className="w-14 h-14 text-amber-400 mb-4" />
        <h1 className="text-xl font-bold mb-2">Confirme seu e-mail</h1>
        <p className="text-stone-400 max-w-sm">
          Enviamos um link de confirmação para <b>{email}</b>. Após confirmar, faça login.
        </p>
        <Link href="/login" className="mt-6 text-amber-400 hover:underline">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-8">
        <Box className="w-7 h-7 text-amber-400" /> CartoDie
      </Link>

      <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl p-7">
        <h1 className="text-xl font-bold mb-1">Criar conta</h1>
        <p className="text-sm text-stone-400 mb-6">Cadastre-se para usar a plataforma.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nome completo">
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-sm focus:border-amber-500 outline-none"
              placeholder="Seu nome"
            />
          </Field>
          <Field label="Empresa (opcional)">
            <input
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              className="w-full rounded-lg bg-stone-950 border border-stone-700 px-3 py-2.5 text-sm focus:border-amber-500 outline-none"
              placeholder="Nome da empresa"
            />
          </Field>
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
              placeholder="mínimo 6 caracteres"
            />
          </Field>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-amber-500 text-stone-950 font-semibold py-2.5 hover:bg-amber-400 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />} Criar conta
          </button>
        </form>

        <p className="text-sm text-stone-400 mt-6 text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Entrar
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
