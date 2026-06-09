"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";

// Aviso de modo demo: aparece quando o Supabase não está configurado.
// Nesse caso os dados ficam salvos apenas no navegador (localStorage).
export function FirebaseConfigBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isSupabaseConfigured());
  }, []);

  if (!show) return null;

  return (
    <div className="relative z-50 bg-emerald-600 px-4 py-2 text-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Modo demonstração.</strong> Os dados
            são salvos apenas neste navegador. Configure o Supabase
            (<code className="rounded bg-white/20 px-1.5 py-0.5">.env.local</code>) para
            persistência na nuvem e login.
          </span>
        </div>
        <button
          onClick={() => setShow(false)}
          className="rounded p-1 transition-colors hover:bg-white/20"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
