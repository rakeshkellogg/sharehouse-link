
-- 1) Mutual blocking (unordered pair) ----------------------------------------

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  -- Unordered pair of users; we'll normalize via trigger so only one row exists per pair
  user_a uuid not null,
  user_b uuid not null,
  created_by uuid not null, -- who initiated the block
  reason text,
  created_at timestamptz not null default now(),
  constraint user_blocks_distinct_pair check (user_a <> user_b)
);

alter table public.user_blocks enable row level security;

-- Ensure we only have one row per unordered pair after normalization
create unique index if not exists user_blocks_unique_pair on public.user_blocks (user_a, user_b);

-- Helpful indexes
create index if not exists user_blocks_user_a_idx on public.user_blocks (user_a);
create index if not exists user_blocks_user_b_idx on public.user_blocks (user_b);

-- Normalize pair so that (user_a, user_b) is always ordered (user_a < user_b)
create or replace function public.normalize_user_blocks_pair()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tmp uuid;
begin
  -- Order by UUID so we have a consistent canonical pair
  if new.user_a > new.user_b then
    tmp := new.user_a;
    new.user_a := new.user_b;
    new.user_b := tmp;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_normalize_user_blocks_pair on public.user_blocks;
create trigger trg_normalize_user_blocks_pair
before insert or update on public.user_blocks
for each row execute function public.normalize_user_blocks_pair();

-- RLS policies: view own, create own, delete own
create policy if not exists "Users can view their own blocks"
on public.user_blocks
for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

create policy if not exists "Users can create blocks they initiate"
on public.user_blocks
for insert
to authenticated
with check (
  created_by = auth.uid()
  and (auth.uid() = user_a or auth.uid() = user_b)
);

create policy if not exists "Users can delete their own blocks"
on public.user_blocks
for delete
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

-- 2) Prevent messaging when blocked -----------------------------------------

-- Function to check if messaging is blocked between two users (unordered pair)
create or replace function public.messaging_blocked(p_user1 uuid, p_user2 uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks b
    where (b.user_a = least(p_user1, p_user2) and b.user_b = greatest(p_user1, p_user2))
  );
$$;

-- Trigger to prevent sending messages between blocked users
create or replace function public.check_message_blocklist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.messaging_blocked(new.sender_user_id, new.owner_user_id) then
    raise exception 'Messaging is blocked between these users. Unblock to continue.'
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

-- Attach triggers on messages:
-- 01: Blocklist check first
drop trigger if exists trg_01_check_message_blocklist on public.messages;
create trigger trg_01_check_message_blocklist
before insert on public.messages
for each row execute function public.check_message_blocklist();

-- 02: Then apply the existing daily rate-limit check
drop trigger if exists trg_02_check_message_rate_limit on public.messages;
create trigger trg_02_check_message_rate_limit
before insert on public.messages
for each row execute function public.check_message_rate_limit();

-- 3) Reporting / Flagging ----------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null,
  reported_user_id uuid,
  listing_id uuid,
  category text not null default 'other',
  reason text,
  details text,
  status text not null default 'open', -- 'open' | 'reviewed' | 'action_taken' | 'dismissed'
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  constraint reports_target_check check (
    reported_user_id is not null or listing_id is not null
  )
);

alter table public.reports enable row level security;

-- RLS: reporters can insert and view their own reports (super-admin view will be added later)
create policy if not exists "Users can create their own reports"
on public.reports
for insert
to authenticated
with check (reporter_user_id = auth.uid());

create policy if not exists "Users can view their own reports"
on public.reports
for select
to authenticated
using (reporter_user_id = auth.uid());

-- Helpful indexes for moderation later
create index if not exists reports_reporter_user_id_idx on public.reports (reporter_user_id);
create index if not exists reports_reported_user_id_idx on public.reports (reported_user_id);
create index if not exists reports_listing_id_idx on public.reports (listing_id);
create index if not exists reports_status_idx on public.reports (status);
