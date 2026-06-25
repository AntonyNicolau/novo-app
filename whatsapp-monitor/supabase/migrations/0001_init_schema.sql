-- Schema inicial — WhatsApp Monitor (sistema de MONITORAMENTO, somente leitura no front)

create table public.sellers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  photo_url   text,
  phone       text,
  work_start  time not null default '08:00',
  work_end    time not null default '18:00',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.whatsapp_sessions (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references public.sellers(id) on delete cascade,
  status           text not null default 'disconnected'
                   check (status in ('disconnected','connecting','qr','connected')),
  qr_code          text,
  phone_jid        text,
  online           boolean not null default false,
  connected_at     timestamptz,
  last_activity_at timestamptz,
  last_sync_at     timestamptz,
  updated_at       timestamptz not null default now(),
  unique(seller_id)
);

create table public.conversations (
  id                uuid primary key default gen_random_uuid(),
  seller_id         uuid not null references public.sellers(id) on delete cascade,
  customer_name     text,
  customer_phone    text not null,
  last_message      text,
  last_message_at   timestamptz,
  last_message_from text check (last_message_from in ('customer','seller')),
  awaiting_reply    boolean not null default false,
  awaiting_since    timestamptz,
  messages_count    integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  seller_id       uuid not null references public.sellers(id) on delete cascade,
  direction       text not null check (direction in ('in','out')),
  body            text,
  wa_message_id   text,
  created_at      timestamptz not null default now()
);

create table public.seller_metrics_daily (
  id                   uuid primary key default gen_random_uuid(),
  seller_id            uuid not null references public.sellers(id) on delete cascade,
  date                 date not null default current_date,
  messages_sent        integer not null default 0,
  messages_received    integer not null default 0,
  conversations_count  integer not null default 0,
  new_conversations    integer not null default 0,
  avg_response_seconds integer not null default 0,
  online_seconds       integer not null default 0,
  offline_seconds      integer not null default 0,
  response_samples     integer not null default 0,
  unique(seller_id, date)
);

create table public.alerts (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in (
                'whatsapp_disconnected','seller_offline','customer_waiting',
                'no_activity','high_volume','sync_failure')),
  severity    text not null default 'warning' check (severity in ('info','warning','critical')),
  seller_id   uuid references public.sellers(id) on delete cascade,
  title       text not null,
  message     text,
  resolved    boolean not null default false,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);

create index idx_conversations_seller   on public.conversations(seller_id);
create index idx_conversations_awaiting on public.conversations(awaiting_reply) where awaiting_reply;
create index idx_conversations_last_msg on public.conversations(last_message_at desc);
create index idx_messages_conversation  on public.messages(conversation_id, created_at desc);
create index idx_messages_seller_date   on public.messages(seller_id, created_at);
create index idx_metrics_seller_date    on public.seller_metrics_daily(seller_id, date desc);
create index idx_alerts_open            on public.alerts(resolved, created_at desc);
create index idx_sessions_seller        on public.whatsapp_sessions(seller_id);
