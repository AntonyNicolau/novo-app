"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase, supabaseConfigured } from "./supabaseClient";

export interface AppUser {
  id: string;
  email: string;
  nome?: string;
  empresa?: string;
}

export type AuthMode = "supabase" | "demo";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  mode: AuthMode;
  signUp: (
    email: string,
    password: string,
    meta: { nome: string; empresa?: string }
  ) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const mode: AuthMode = supabaseConfigured ? "supabase" : "demo";

// -------------------- Modo demonstração (local) --------------------
// Armazena usuários no navegador apenas para teste do fluxo. NÃO é seguro
// para produção — em produção, configure o Supabase (ver DEPLOY-CLOUDFLARE.md).
const LS_USERS = "cartodie_demo_users";
const LS_SESSION = "cartodie_demo_session";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface DemoRecord extends AppUser {
  senhaHash: string;
}

function readDemoUsers(): DemoRecord[] {
  try {
    return JSON.parse(localStorage.getItem(LS_USERS) || "[]");
  } catch {
    return [];
  }
}

function writeDemoUsers(users: DemoRecord[]) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (mode === "supabase" && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        const u = data.session?.user;
        setUser(u ? toAppUser(u) : null);
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ? toAppUser(session.user) : null);
      });
      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    } else {
      try {
        const s = localStorage.getItem(LS_SESSION);
        setUser(s ? JSON.parse(s) : null);
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  const signUp = useCallback<AuthState["signUp"]>(async (email, password, meta) => {
    if (mode === "supabase" && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nome: meta.nome, empresa: meta.empresa } },
      });
      if (error) return { error: traduzErro(error.message) };
      return { needsConfirmation: !data.session };
    }
    // demo
    const users = readDemoUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "Este e-mail já está cadastrado." };
    }
    const rec: DemoRecord = {
      id: crypto.randomUUID(),
      email,
      nome: meta.nome,
      empresa: meta.empresa,
      senhaHash: await sha256(password),
    };
    users.push(rec);
    writeDemoUsers(users);
    const appUser: AppUser = { id: rec.id, email, nome: meta.nome, empresa: meta.empresa };
    localStorage.setItem(LS_SESSION, JSON.stringify(appUser));
    setUser(appUser);
    return {};
  }, []);

  const signIn = useCallback<AuthState["signIn"]>(async (email, password) => {
    if (mode === "supabase" && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: traduzErro(error.message) };
      return {};
    }
    // demo
    const users = readDemoUsers();
    const rec = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!rec || rec.senhaHash !== (await sha256(password))) {
      return { error: "E-mail ou senha incorretos." };
    }
    const appUser: AppUser = { id: rec.id, email: rec.email, nome: rec.nome, empresa: rec.empresa };
    localStorage.setItem(LS_SESSION, JSON.stringify(appUser));
    setUser(appUser);
    return {};
  }, []);

  const signOut = useCallback(async () => {
    if (mode === "supabase" && supabase) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(LS_SESSION);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, mode, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAppUser(u: any): AppUser {
  return {
    id: u.id,
    email: u.email ?? "",
    nome: u.user_metadata?.nome,
    empresa: u.user_metadata?.empresa,
  };
}

function traduzErro(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (m.includes("password")) return "Senha inválida (mínimo 6 caracteres).";
  if (m.includes("email")) return "E-mail inválido.";
  return msg;
}
