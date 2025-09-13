-- First, let's check what this view contains
SELECT definition FROM pg_views WHERE viewname = 'public_listings';

-- If it's just exposing the listings table data, we should drop it
-- since we already have proper security functions like get_public_listing()
DROP VIEW IF EXISTS public.public_listings;

-- The secure way to access public listings is through the existing functions:
-- - get_public_listing(uuid) 
-- - get_public_listings_by_ids(uuid[])
-- - search_public_listings(text)
-- These functions have proper security controls built in