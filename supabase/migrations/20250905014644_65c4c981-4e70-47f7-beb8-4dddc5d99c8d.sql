
-- Message rate limiting: 2 messages per day from a sender to a specific recipient (owner_user_id)

-- 1) Helper function: whether a sender can send a message to a recipient today
create or replace function public.can_send_message_today(sender_id uuid, recipient_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  start_ts timestamptz;
  msg_count int;
begin
  -- Start of current day in server timezone (Supabase runs in UTC)
  start_ts := date_trunc('day', now());

  select count(*) into msg_count
  from public.messages
  where sender_user_id = sender_id
    and owner_user_id = recipient_id
    and created_at >= start_ts
    and created_at < (start_ts + interval '1 day');

  return coalesce(msg_count, 0) < 2;
end;
$$;

-- 2) Helper function: remaining quota for today for a sender->recipient
create or replace function public.get_remaining_messages_today(sender_id uuid, recipient_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  start_ts timestamptz;
  msg_count int;
begin
  start_ts := date_trunc('day', now());

  select count(*) into msg_count
  from public.messages
  where sender_user_id = sender_id
    and owner_user_id = recipient_id
    and created_at >= start_ts
    and created_at < (start_ts + interval '1 day');

  return greatest(0, 2 - coalesce(msg_count, 0));
end;
$$;

-- 3) Trigger function to enforce the limit on insert
create or replace function public.check_message_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_send_message_today(new.sender_user_id, new.owner_user_id) then
    raise exception 'Rate limit exceeded: You can only send 2 messages per day to each user. Please try again tomorrow.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

-- 4) Attach trigger to messages table
drop trigger if exists message_rate_limit_trigger on public.messages;

create trigger message_rate_limit_trigger
  before insert on public.messages
  for each row
  execute function public.check_message_rate_limit();

-- 5) Performance index to support the counting query
create index if not exists idx_messages_rate_limit
  on public.messages (sender_user_id, owner_user_id, created_at);

-- 6) Optional: grant execute on helper functions to authenticated role
-- (Supabase typically allows EXECUTE by default, but these grants are explicit)
grant execute on function public.can_send_message_today(uuid, uuid) to authenticated;
grant execute on function public.get_remaining_messages_today(uuid, uuid) to authenticated;
