-- CartoDie — esquema inicial do Supabase
-- Execute no Supabase: SQL Editor → New query → cole tudo → Run.
-- Cria perfis (com plano) e orçamentos, com RLS para que cada cliente
-- enxergue somente os próprios dados.

-- ----------------------------------------------------------------------------
-- PERFIS
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  empresa text,
  plano text not null default 'gratuito', -- 'gratuito' | 'mensal' (futuro)
  criado_em timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "perfil_proprio_select" on public.profiles;
create policy "perfil_proprio_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "perfil_proprio_update" on public.profiles;
create policy "perfil_proprio_update" on public.profiles
  for update using (auth.uid() = id);

-- Cria o perfil automaticamente quando um usuário se cadastra,
-- aproveitando os metadados (nome, empresa) enviados no signUp.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, empresa)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'empresa'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- ORÇAMENTOS
-- ----------------------------------------------------------------------------
create table if not exists public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  fefco text not null,
  c numeric not null,
  l numeric not null,
  h numeric not null,
  flute text not null,
  esp_real numeric,
  tipo_faca text not null,
  kerf numeric not null,
  custo_total numeric not null,
  criado_em timestamptz not null default now()
);

create index if not exists orcamentos_user_idx on public.orcamentos (user_id, criado_em desc);

alter table public.orcamentos enable row level security;

-- Cada cliente só acessa os próprios orçamentos.
drop policy if exists "orcamentos_proprios" on public.orcamentos;
create policy "orcamentos_proprios" on public.orcamentos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Segurança: a função do gatilho não precisa ser chamável via API (RPC).
revoke execute on function public.handle_new_user() from anon, authenticated, public;
