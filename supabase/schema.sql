-- FuelWise — schema do banco (Supabase / Postgres)
-- Execute no SQL Editor do Supabase para habilitar a persistência remota.
-- Sem isso, o app funciona em "modo demo" usando localStorage no navegador.

-- Veículos da frota
create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  plate text not null,
  name text,
  tank_capacity numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Abastecimentos registrados pelos motoristas
create table if not exists public.fuel_entries (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade default auth.uid(),
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  driver_name text,
  date timestamptz not null default now(),
  odometer numeric not null,
  liters numeric not null,
  total_cost numeric not null,
  station text,
  created_at timestamptz not null default now()
);

create index if not exists fuel_entries_vehicle_idx on public.fuel_entries (vehicle_id);
create index if not exists fuel_entries_date_idx on public.fuel_entries (date);

-- Row Level Security: cada usuário enxerga apenas seus próprios dados.
alter table public.vehicles enable row level security;
alter table public.fuel_entries enable row level security;

drop policy if exists "vehicles_owner" on public.vehicles;
create policy "vehicles_owner" on public.vehicles
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "fuel_entries_owner" on public.fuel_entries;
create policy "fuel_entries_owner" on public.fuel_entries
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
