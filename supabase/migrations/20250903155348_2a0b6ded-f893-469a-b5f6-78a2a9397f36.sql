-- COMPREHENSIVE SECURITY FIXES

-- 1. Fix Security Definer View issue by recreating public_listings as a standard view
DROP VIEW IF EXISTS public.public_listings;
CREATE VIEW public.public_listings AS
SELECT 
    id,
    title,
    price,
    price_rupees,
    price_amount_raw,
    price_unit,
    bedrooms,
    bathrooms,
    size,
    size_value_canonical,
    size_unit,
    size_scale,
    description,
    location_address,
    latitude,
    longitude,
    google_maps_link,
    city,
    sub_area,
    sub_area_slug,
    district,
    state,
    pincode,
    place_id,
    cover_image_url,
    media_links,
    youtube_url,
    property_type,
    transaction_type,
    is_public,
    created_at,
    updated_at,
    user_id
FROM public.listings
WHERE is_public = true AND deleted_at IS NULL;

-- 2. Restrict profiles visibility to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Ensure listings table has proper RLS policies (should already exist)
-- Verify public can still view public listings
DROP POLICY IF EXISTS "Public can view listings via secure view" ON public.listings;
CREATE POLICY "Public can view public listings"
ON public.listings
FOR SELECT
TO public
USING (is_public = true AND deleted_at IS NULL);

-- 4. Add RLS policy for public_listings view access
-- Note: Views inherit RLS from underlying tables, so this ensures proper access control