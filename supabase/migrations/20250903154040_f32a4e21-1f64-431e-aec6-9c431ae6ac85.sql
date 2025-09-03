
-- 1) Remove sensitive owner contact fields from listings
ALTER TABLE public.listings
  DROP COLUMN IF EXISTS owner_name,
  DROP COLUMN IF EXISTS owner_phone,
  DROP COLUMN IF EXISTS owner_whatsapp;

-- 2) Remove username from profiles to stop storing usernames
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS username;
