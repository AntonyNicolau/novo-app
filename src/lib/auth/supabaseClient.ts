import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase seguro: só é criado quando as variáveis estão configuradas.
// Sem configuração, `supabase` é null e o app usa o modo demonstração local.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!(url && key && url.includes("supabase"));

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url!, key!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;
