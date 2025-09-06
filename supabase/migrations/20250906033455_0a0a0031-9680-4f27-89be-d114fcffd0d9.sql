
-- PHASE 1: Super Admin Foundation, RLS, Validations, and Analytics

-- 1) Roles & Super Admin

create type if not exists public.app_role as enum ('super_admin', 'moderator', 'user');

create table if not exists public.admin_emails (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- Helper to check explicit role by user_id
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- Super admin detection:
--  - explicit role OR
--  - email in admin_emails (via JWT claims, no need to read auth.users)
create or replace function public.is_super_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  user_email text;
begin
  -- email from JWT claims
  user_email := (auth.jwt() ->> 'email');

  return
    coalesce(public.has_role(auth.uid(), 'super_admin'), false)
    or coalesce(
      (select exists (select 1 from public.admin_emails ae where ae.email = user_email)),
      false
    );
end;
$$;

alter table public.admin_emails enable row level security;

-- Only super admins can manage admin_emails
drop policy if exists "Super admins manage admin_emails" on public.admin_emails;
create policy "Super admins manage admin_emails"
on public.admin_emails
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

alter table public.user_roles enable row level security;

-- Users can read their own roles
drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

-- Super admins manage all roles
drop policy if exists "Super admins manage all roles" on public.user_roles;
create policy "Super admins manage all roles"
on public.user_roles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());



-- 2) App Config & Limits (safe defaults)

create table if not exists public.app_config (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Everyone can read config (authenticated); only super admins modify
drop policy if exists "Read config" on public.app_config;
create policy "Read config"
on public.app_config
for select
to authenticated
using (true);

drop policy if exists "Super admins manage config" on public.app_config;
create policy "Super admins manage config"
on public.app_config
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- Auto-update updated_at on changes
drop trigger if exists set_updated_at_app_config on public.app_config;
create trigger set_updated_at_app_config
before update on public.app_config
for each row
execute function public.set_updated_at();

-- Helper functions to read config values
create or replace function public.get_config_int(_key text, _default integer)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (value ->> 'value')::int from public.app_config where key = _key),
    _default
  )
$$;

create or replace function public.get_config_bool(_key text, _default boolean)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select (value ->> 'value')::boolean from public.app_config where key = _key),
    _default
  )
$$;

create or replace function public.is_maintenance_mode()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.get_config_bool('maintenance_mode', false)
$$;

-- Seed defaults (no-op if exists)
insert into public.app_config (key, value) values
  ('max_messages_per_day', jsonb_build_object('value', 2))
on conflict (key) do nothing;

insert into public.app_config (key, value) values
  ('maintenance_mode', jsonb_build_object('value', false))
on conflict (key) do nothing;

-- Update rate limit functions to use config
create or replace function public.can_send_message_today(sender_id uuid, recipient_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = 'public'
as $function$
declare
  start_ts timestamptz;
  msg_count int;
  max_per_day int;
begin
  start_ts := date_trunc('day', now());
  max_per_day := public.get_config_int('max_messages_per_day', 2);

  select count(*) into msg_count
  from public.messages
  where sender_user_id = sender_id
    and owner_user_id = recipient_id
    and created_at >= start_ts
    and created_at < (start_ts + interval '1 day');

  return coalesce(msg_count, 0) < max_per_day;
end;
$function$;

create or replace function public.get_remaining_messages_today(sender_id uuid, recipient_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = 'public'
as $function$
declare
  start_ts timestamptz;
  msg_count int;
  max_per_day int;
begin
  start_ts := date_trunc('day', now());
  max_per_day := public.get_config_int('max_messages_per_day', 2);

  select count(*) into msg_count
  from public.messages
  where sender_user_id = sender_id
    and owner_user_id = recipient_id
    and created_at >= start_ts
    and created_at < (start_ts + interval '1 day');

  return greatest(0, max_per_day - coalesce(msg_count, 0));
end;
$function$;



-- 3) Moderation primitives

create table if not exists public.user_moderation (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  reason text,
  deactivated_at timestamptz,
  deactivated_by uuid references auth.users(id)
);

alter table public.user_moderation enable row level security;

-- User can read their own moderation status
drop policy if exists "User can view own moderation" on public.user_moderation;
create policy "User can view own moderation"
on public.user_moderation
for select
to authenticated
using (auth.uid() = user_id);

-- Super admins fully manage moderation
drop policy if exists "Super admins manage moderation" on public.user_moderation;
create policy "Super admins manage moderation"
on public.user_moderation
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- Helper: active check defaults to true if no row
create or replace function public.is_user_active(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_active from public.user_moderation where user_id = _user_id),
    true
  )
$$;

-- Blocks
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

alter table public.user_blocks enable row level security;

drop policy if exists "Users can view their blocks" on public.user_blocks;
create policy "Users can view their blocks"
on public.user_blocks
for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Users can create blocks" on public.user_blocks;
create policy "Users can create blocks"
on public.user_blocks
for insert
to authenticated
with check (auth.uid() = user_a);

drop policy if exists "Users can delete their blocks" on public.user_blocks;
create policy "Users can delete their blocks"
on public.user_blocks
for delete
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Super admins manage blocks" on public.user_blocks;
create policy "Super admins manage blocks"
on public.user_blocks
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- Reports
do $$
begin
  if not exists (select 1 from pg_type where typname = 'report_target') then
    create type public.report_target as enum ('user', 'listing', 'message');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status') then
    create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
  end if;
end$$;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_type public.report_target not null,
  target_user_id uuid,
  listing_id uuid,
  message_id uuid,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id),
  constraint one_target check (
    ((target_user_id is not null)::int +
     (listing_id is not null)::int +
     (message_id is not null)::int) = 1
  )
);

alter table public.reports enable row level security;

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports"
on public.reports
for select
to authenticated
using (auth.uid() = reporter_user_id);

drop policy if exists "Users can create reports" on public.reports;
create policy "Users can create reports"
on public.reports
for insert
to authenticated
with check (auth.uid() = reporter_user_id);

drop policy if exists "Super admins manage reports" on public.reports;
create policy "Super admins manage reports"
on public.reports
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());



-- 4) Announcements

do $$
begin
  if not exists (select 1 from pg_type where typname = 'announcement_level') then
    create type public.announcement_level as enum ('info', 'warning', 'critical');
  end if;
end$$;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text not null,
  level public.announcement_level not null default 'info',
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- Public (anon + authenticated) can read active/current announcements
drop policy if exists "Public can read active announcements" on public.announcements;
create policy "Public can read active announcements"
on public.announcements
for select
to anon, authenticated
using (
  is_active
  and (starts_at is null or now() >= starts_at)
  and (ends_at is null or now() <= ends_at)
);

-- Super admins manage announcements
drop policy if exists "Super admins manage announcements" on public.announcements;
create policy "Super admins manage announcements"
on public.announcements
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- updated_at trigger
drop trigger if exists set_updated_at_announcements on public.announcements;
create trigger set_updated_at_announcements
before update on public.announcements
for each row
execute function public.set_updated_at();



-- 5) Validations via triggers (messages & listings)

-- Enforce per-message validations (active user, maintenance off, not blocked)
create or replace function public.enforce_message_validations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_user_active(new.sender_user_id) then
    raise exception 'Account is deactivated. You cannot send messages.';
  end if;

  if public.is_maintenance_mode() then
    raise exception 'The site is in maintenance mode. Sending messages is temporarily disabled.';
  end if;

  if exists (
    select 1
    from public.user_blocks b
    where (b.user_a = new.sender_user_id and b.user_b = new.owner_user_id)
       or (b.user_a = new.owner_user_id and b.user_b = new.sender_user_id)
  ) then
    raise exception 'You cannot message this user because one of you has blocked the other.';
  end if;

  return new;
end;
$$;

-- Wire both validations and rate-limit triggers
drop trigger if exists before_insert_message_validations on public.messages;
create trigger before_insert_message_validations
before insert on public.messages
for each row
execute function public.enforce_message_validations();

-- Use the existing rate-limit guard (now backed by app_config)
drop trigger if exists before_insert_message_rate_limit on public.messages;
create trigger before_insert_message_rate_limit
before insert on public.messages
for each row
execute function public.check_message_rate_limit();

-- Listings: enforce active user & maintenance mode on create/update
create or replace function public.enforce_listing_validations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_user_active(new.user_id) then
    raise exception 'Account is deactivated. You cannot create or update listings.';
  end if;

  if public.is_maintenance_mode() then
    raise exception 'The site is in maintenance mode. Creating or updating listings is temporarily disabled.';
  end if;

  return new;
end;
$$;

drop trigger if exists before_insert_listing_validations on public.listings;
create trigger before_insert_listing_validations
before insert on public.listings
for each row
execute function public.enforce_listing_validations();

drop trigger if exists before_update_listing_validations on public.listings;
create trigger before_update_listing_validations
before update on public.listings
for each row
execute function public.enforce_listing_validations();

-- Ensure listings.updated_at is maintained
drop trigger if exists set_updated_at_listings on public.listings;
create trigger set_updated_at_listings
before update on public.listings
for each row
execute function public.set_updated_at();



-- 6) Super admin bypass policies (non-intrusive)

-- Listings
-- Allow super admins to read/modify/delete anything without affecting existing policies
do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'listings' and policyname = 'Super admins can read all listings'
  ) then
    create policy "Super admins can read all listings"
    on public.listings
    for select
    to authenticated
    using (public.is_super_admin());
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'listings' and policyname = 'Super admins can modify all listings'
  ) then
    create policy "Super admins can modify all listings"
    on public.listings
    for update
    to authenticated
    using (public.is_super_admin())
    with check (public.is_super_admin());
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'listings' and policyname = 'Super admins can delete listings'
  ) then
    create policy "Super admins can delete listings"
    on public.listings
    for delete
    to authenticated
    using (public.is_super_admin());
  end if;
end$$;

-- Messages
do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Super admins can read all messages'
  ) then
    create policy "Super admins can read all messages"
    on public.messages
    for select
    to authenticated
    using (public.is_super_admin());
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Super admins can update messages'
  ) then
    create policy "Super admins can update messages"
    on public.messages
    for update
    to authenticated
    using (public.is_super_admin())
    with check (public.is_super_admin());
  end if;

  -- DELETE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Super admins can delete messages'
  ) then
    create policy "Super admins can delete messages"
    on public.messages
    for delete
    to authenticated
    using (public.is_super_admin());
  end if;
end$$;

-- Profiles (read + update any)
do $$
begin
  -- SELECT
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Super admins can read all profiles'
  ) then
    create policy "Super admins can read all profiles"
    on public.profiles
    for select
    to authenticated
    using (public.is_super_admin());
  end if;

  -- UPDATE
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Super admins can update any profile'
  ) then
    create policy "Super admins can update any profile"
    on public.profiles
    for update
    to authenticated
    using (public.is_super_admin())
    with check (public.is_super_admin());
  end if;
end$$;



-- 7) Admin analytics RPC

create or replace function public.admin_get_metrics(_start date, _end date)
returns table (
  day date,
  new_users int,
  new_listings int,
  active_chats int
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'insufficient_privileges';
  end if;

  return query
  with d as (
    select generate_series(_start, _end, interval '1 day')::date as day
  )
  select
    d.day,
    coalesce((select count(*) from auth.users u where u.created_at::date = d.day), 0) as new_users,
    coalesce((select count(*) from public.listings l where l.created_at::date = d.day), 0) as new_listings,
    coalesce((select count(distinct m.sender_user_id) from public.messages m where m.created_at::date = d.day), 0) as active_chats
  from d
  order by d.day;
end;
$$;
