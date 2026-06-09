import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Verifica se o Supabase está configurado corretamente
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase.co'));
};

// Placeholders válidos para evitar que createClient lance erro quando o
// Supabase não está configurado (modo demo). isSupabaseConfigured() continua
// retornando false, então nenhuma chamada remota é feita.
const fallbackUrl = "https://placeholder.supabase.co";
const fallbackKey = "public-anon-placeholder-key";

// Cria o cliente Supabase
export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Helper para verificar se há sessão ativa
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Helper para obter usuário atual
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
