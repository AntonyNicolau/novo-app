// Aviso exibido nas telas de auth quando o app está em modo demonstração
// (sem Supabase configurado). Em produção este aviso não aparece.
export function DemoBadge() {
  return (
    <p className="mt-6 max-w-sm text-center text-[11px] text-stone-500">
      Modo demonstração: contas salvas apenas neste navegador. Para produção, configure o
      Supabase (ver DEPLOY-CLOUDFLARE.md).
    </p>
  );
}
