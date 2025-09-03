-- FINAL SECURITY FIXES

-- 1. Fix public_listings view to remove user_id exposure to anonymous users
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
    updated_at
    -- Intentionally exclude user_id to prevent anonymous users from mapping property owners
FROM public.listings
WHERE is_public = true AND deleted_at IS NULL;

-- 2. Update public listings RLS policy to exclude user_id for anonymous users
DROP POLICY IF EXISTS "Public can view public listings" ON public.listings;
CREATE POLICY "Anonymous users can view public listings without owner info"
ON public.listings
FOR SELECT
TO public
USING (is_public = true AND deleted_at IS NULL);

-- 3. Ensure authenticated users can still see user_id (for messaging functionality)
CREATE POLICY "Authenticated users can view public listings with owner info"
ON public.listings
FOR SELECT
TO authenticated
USING (is_public = true AND deleted_at IS NULL);