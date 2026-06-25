import { createClient } from "@supabase/supabase-js";

// Chaves públicas (seguras para o front). Podem ser sobrescritas por env na Vercel.
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://jkyavukompbnzuotelpl.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_OeNMMlH-1xrxFCn7_rw7Jg_Ml0choKg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 5 } },
  auth: { persistSession: false },
});
