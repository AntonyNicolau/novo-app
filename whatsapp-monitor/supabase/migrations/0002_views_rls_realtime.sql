-- Views de agregação, RLS e Realtime

create or replace view public.dashboard_stats
with (security_invoker = on) as
select
  (select count(*) from public.sellers where active)                                                  as total_sellers,
  (select count(*) from public.whatsapp_sessions ws join public.sellers s on s.id=ws.seller_id
     where s.active and ws.online)                                                                     as online_sellers,
  (select count(*) from public.whatsapp_sessions ws join public.sellers s on s.id=ws.seller_id
     where s.active and not ws.online)                                                                 as offline_sellers,
  (select count(*) from public.conversations)                                                          as open_conversations,
  (select count(*) from public.conversations where created_at::date = current_date)                    as new_conversations_today,
  (select coalesce(sum(messages_sent),0)     from public.seller_metrics_daily where date=current_date)  as messages_sent_today,
  (select coalesce(sum(messages_received),0) from public.seller_metrics_daily where date=current_date)  as messages_received_today,
  (select coalesce(round(avg(nullif(avg_response_seconds,0)))::int,0)
     from public.seller_metrics_daily where date=current_date)                                          as avg_response_seconds,
  (select count(*) from public.conversations where awaiting_reply)                                      as customers_waiting,
  (select count(*) from public.whatsapp_sessions ws join public.sellers s on s.id=ws.seller_id
     where s.active and ws.status='disconnected')                                                       as whatsapp_disconnected,
  (select count(*) from public.alerts where not resolved)                                               as active_alerts;

create or replace view public.seller_overview
with (security_invoker = on) as
select
  s.id, s.name, s.photo_url, s.phone, s.work_start, s.work_end,
  coalesce(ws.status,'disconnected') as session_status,
  coalesce(ws.online,false)          as online,
  ws.connected_at, ws.last_activity_at, ws.last_sync_at,
  coalesce(m.messages_sent,0)        as messages_sent_today,
  coalesce(m.messages_received,0)    as messages_received_today,
  coalesce(m.avg_response_seconds,0) as avg_response_seconds,
  coalesce(m.online_seconds,0)       as online_seconds,
  coalesce(m.offline_seconds,0)      as offline_seconds,
  (select count(*) from public.conversations c where c.seller_id = s.id)                       as conversations_count,
  (select count(*) from public.conversations c where c.seller_id = s.id and c.awaiting_reply)  as awaiting_count
from public.sellers s
left join public.whatsapp_sessions  ws on ws.seller_id = s.id
left join public.seller_metrics_daily m on m.seller_id = s.id and m.date = current_date
where s.active;

alter table public.sellers              enable row level security;
alter table public.whatsapp_sessions    enable row level security;
alter table public.conversations        enable row level security;
alter table public.messages             enable row level security;
alter table public.seller_metrics_daily enable row level security;
alter table public.alerts               enable row level security;

create policy anon_read on public.sellers              for select to anon, authenticated using (true);
create policy anon_read on public.whatsapp_sessions    for select to anon, authenticated using (true);
create policy anon_read on public.conversations        for select to anon, authenticated using (true);
create policy anon_read on public.messages             for select to anon, authenticated using (true);
create policy anon_read on public.seller_metrics_daily for select to anon, authenticated using (true);
create policy anon_read on public.alerts               for select to anon, authenticated using (true);

create policy anon_write_sellers  on public.sellers           for all    to anon, authenticated using (true) with check (true);
create policy anon_write_sessions on public.whatsapp_sessions for all    to anon, authenticated using (true) with check (true);
create policy anon_resolve_alerts on public.alerts            for update to anon, authenticated using (true) with check (true);

alter publication supabase_realtime add table public.sellers;
alter publication supabase_realtime add table public.whatsapp_sessions;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.seller_metrics_daily;
