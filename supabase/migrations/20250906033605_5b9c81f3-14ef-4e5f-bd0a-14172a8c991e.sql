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

-- Add your email as super admin
INSERT INTO public.admin_emails (email, note) 
VALUES ('RAKESH.NW.KELLOGG@GMAIL.COM', 'Project owner - auto super admin access')
ON CONFLICT (email) DO NOTHING;