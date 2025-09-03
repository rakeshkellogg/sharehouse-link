-- Fix the security definer view issue by removing security_barrier
-- and updating the approach to be more secure

-- Drop the existing view and recreate without security_barrier
DROP VIEW IF EXISTS public.public_listings;

-- Create a simple view without security definer properties  
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
  -- Explicitly exclude: owner_name, owner_phone, owner_whatsapp
FROM public.listings 
WHERE is_public = true AND deleted_at IS NULL;

-- Grant appropriate access to the view
GRANT SELECT ON public.public_listings TO anon;
GRANT SELECT ON public.public_listings TO authenticated;

-- Update RLS policy on the view to ensure security
ALTER VIEW public.public_listings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the view
CREATE POLICY "Anyone can view public listings without contact info" 
ON public.public_listings 
FOR SELECT 
USING (true);