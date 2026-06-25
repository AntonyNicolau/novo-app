-- Funções chamadas pelo conector (service_role)

create or replace function public.record_wa_message(
  p_seller uuid, p_customer_phone text, p_customer_name text,
  p_direction text, p_body text, p_wa_id text, p_ts timestamptz default now()
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_conv public.conversations;
  v_is_new boolean := false;
  v_resp integer := null;
begin
  select * into v_conv from public.conversations
   where seller_id = p_seller and customer_phone = p_customer_phone limit 1;

  if not found then
    insert into public.conversations (seller_id, customer_phone, customer_name, created_at, updated_at)
    values (p_seller, p_customer_phone, nullif(p_customer_name,''), p_ts, p_ts)
    returning * into v_conv;
    v_is_new := true;
  end if;

  insert into public.messages (conversation_id, seller_id, direction, body, wa_message_id, created_at)
  values (v_conv.id, p_seller, p_direction, p_body, p_wa_id, p_ts);

  if p_direction = 'out' and v_conv.awaiting_reply and v_conv.awaiting_since is not null then
    v_resp := greatest(0, floor(extract(epoch from (p_ts - v_conv.awaiting_since)))::int);
  end if;

  update public.conversations set
    last_message      = p_body,
    last_message_at   = p_ts,
    last_message_from = case when p_direction='in' then 'customer' else 'seller' end,
    messages_count    = messages_count + 1,
    customer_name     = coalesce(nullif(p_customer_name,''), customer_name),
    awaiting_reply    = (p_direction = 'in'),
    awaiting_since    = case when p_direction='in' then coalesce(awaiting_since, p_ts) else null end,
    updated_at        = p_ts
  where id = v_conv.id;

  insert into public.seller_metrics_daily
    (seller_id, date, messages_sent, messages_received, new_conversations, conversations_count)
  values
    (p_seller, current_date,
     case when p_direction='out' then 1 else 0 end,
     case when p_direction='in'  then 1 else 0 end,
     case when v_is_new then 1 else 0 end,
     (select count(*) from public.conversations where seller_id = p_seller))
  on conflict (seller_id, date) do update set
     messages_sent       = public.seller_metrics_daily.messages_sent     + (case when p_direction='out' then 1 else 0 end),
     messages_received   = public.seller_metrics_daily.messages_received + (case when p_direction='in'  then 1 else 0 end),
     new_conversations   = public.seller_metrics_daily.new_conversations + (case when v_is_new then 1 else 0 end),
     conversations_count = (select count(*) from public.conversations where seller_id = p_seller);

  if v_resp is not null then
    update public.seller_metrics_daily set
      avg_response_seconds = ((avg_response_seconds * response_samples) + v_resp) / (response_samples + 1),
      response_samples     = response_samples + 1
    where seller_id = p_seller and date = current_date;
  end if;
end; $$;

create or replace function public.set_session_status(
  p_seller uuid, p_status text, p_qr text default null,
  p_jid text default null, p_online boolean default null
) returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.whatsapp_sessions
    (seller_id, status, qr_code, phone_jid, online, connected_at, last_sync_at, last_activity_at, updated_at)
  values
    (p_seller, p_status, p_qr, p_jid, coalesce(p_online,false),
     case when p_status='connected' then now() else null end, now(), now(), now())
  on conflict (seller_id) do update set
     status       = p_status,
     qr_code      = case when p_status='qr' then p_qr else null end,
     phone_jid    = coalesce(p_jid, public.whatsapp_sessions.phone_jid),
     online       = coalesce(p_online, public.whatsapp_sessions.online),
     connected_at = case when p_status='connected' then now() else public.whatsapp_sessions.connected_at end,
     last_sync_at = now(),
     updated_at   = now();

  if p_status = 'disconnected' then
    insert into public.alerts (type, severity, seller_id, title, message)
    select 'whatsapp_disconnected','critical', p_seller,
           'WhatsApp desconectado',
           'A sessão de '|| s.name ||' foi encerrada. Reconexão necessária.'
    from public.sellers s where s.id = p_seller;
  end if;
end; $$;

-- Estas funções são exclusivas do conector (service_role). Revoga das chaves
-- públicas para impedir injeção de dados via /rest/v1/rpc/...
revoke execute on function public.record_wa_message(uuid, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke execute on function public.set_session_status(uuid, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.record_wa_message(uuid, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.set_session_status(uuid, text, text, text, boolean) to service_role;
