"use client";

import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

// Exibe o usuário logado e botão de sair. Usado no cabeçalho da ferramenta.
export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex flex-col items-end leading-tight">
        <span className="text-sm font-medium">{user.nome ?? user.email}</span>
        {user.empresa && <span className="text-xs text-stone-400">{user.empresa}</span>}
      </div>
      <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
        <User className="w-4 h-4 text-amber-400" />
      </div>
      <button
        onClick={async () => {
          await signOut();
          router.replace("/login");
        }}
        className="flex items-center gap-1 text-sm text-stone-300 hover:text-white"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </div>
  );
}
