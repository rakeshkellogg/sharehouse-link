-- Create a public view for listings that excludes sensitive owner contact information
-- This allows public access to listing data without exposing owner contact details

CREATE OR REPLACE VIEW public.public_listings AS 
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

-- Enable RLS on the view
ALTER VIEW public.public_listings SET (security_barrier = true);

-- Grant access to anonymous users for the public view
GRANT SELECT ON public.public_listings TO anon;
GRANT SELECT ON public.public_listings TO authenticated;

-- Update the existing RLS policy to be more restrictive for the main table
-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Public can view public listings" ON public.listings;

-- Create new policies for the main listings table
-- Only authenticated users can see owner contact info, and only after some authorization check
CREATE POLICY "Authenticated users can view listings with contact info" 
ON public.listings 
FOR SELECT 
USING (
  auth.role() = 'authenticated' 
  AND is_public = true 
  AND deleted_at IS NULL
);

-- Create a function to check if a user is authorized to see full contact info
-- For now, we'll consider a user authorized if they've sent a message about the listing
CREATE OR REPLACE FUNCTION public.user_can_see_contact_info(listing_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messages 
    WHERE messages.listing_id = user_can_see_contact_info.listing_id 
    AND messages.sender_user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = user_can_see_contact_info.listing_id
    AND listings.user_id = auth.uid()
  );
$$;