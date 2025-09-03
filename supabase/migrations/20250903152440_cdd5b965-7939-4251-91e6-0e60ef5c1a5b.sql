-- Drop and recreate the public view properly
DROP VIEW IF EXISTS public.public_listings;

-- Create the secure public view without owner contact information
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

-- Grant access to both anonymous and authenticated users
GRANT SELECT ON public.public_listings TO anon;
GRANT SELECT ON public.public_listings TO authenticated;

-- Add a policy to allow public access through this view
CREATE POLICY "Public can view listings via secure view" 
ON public.listings 
FOR SELECT 
USING (is_public = true AND deleted_at IS NULL);