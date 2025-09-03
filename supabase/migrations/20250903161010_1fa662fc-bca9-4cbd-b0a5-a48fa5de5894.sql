
-- Recreate the view as a security invoker so underlying RLS is enforced
DROP VIEW IF EXISTS public.public_listings;

CREATE VIEW public.public_listings
WITH (security_invoker = true) AS
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
FROM public.listings
WHERE is_public = true AND deleted_at IS NULL;

-- Ensure the API roles can read the view; RLS on public.listings will still apply
GRANT SELECT ON public.public_listings TO anon;
GRANT SELECT ON public.public_listings TO authenticated;
