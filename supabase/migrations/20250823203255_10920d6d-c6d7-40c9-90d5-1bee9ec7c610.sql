
  -- 1) Create the listings table
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null, -- owner of the listing (auth.uid())
  title text not null,
  price integer not null,
  bedrooms text,          -- stored as text to accommodate "studio", "5+" etc.
  bathrooms text,         -- stored as text to accommodate "1.5" etc.
  size text,              -- keep free-form (e.g., "1,200 sqft")
  description text,
  location_address text,
  latitude double precision,
  longitude double precision,
  google_maps_link text,
  media_links text[] not null default '{}'::text[],
  owner_name text not null,
  owner_phone text,
  owner_whatsapp text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index for per-user queries
create index listings_user_id_idx on public.listings (user_id, created_at desc);

-- 2) Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_listings_set_updated_at on public.listings;
create trigger trg_listings_set_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

-- 3) Enable Row Level Security
alter table public.listings enable row level security;

-- 4) RLS policies
-- Public can view public listings (to allow sharing without login)
create policy "Public can view public listings"
on public.listings
for select
using (is_public);

-- Users can view their own listings
create policy "Users can view their own listings"
on public.listings
for select
using (auth.uid() = user_id);

-- Users can create their own listings
create policy "Users can create their own listings"
on public.listings
for insert
with check (auth.uid() = user_id);

-- Users can update their own listings
create policy "Users can update their own listings"
on public.listings
for update
using (auth.uid() = user_id);

-- Users can delete their own listings
create policy "Users can delete their own listings"
on public.listings
for delete
using (auth.uid() = user_id);
  