-- Remove direct access to public_listings view for anonymous users
-- (Keep it for authenticated users and service role)
DROP POLICY IF EXISTS "Allow public read access to public listings" ON public.public_listings;

-- Create a more restrictive policy for public_listings
CREATE POLICY "Authenticated users can read public listings" 
ON public.public_listings 
FOR SELECT 
USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Tighten listings table access - remove overly permissive anonymous access
DROP POLICY IF EXISTS "Authenticated users can view public listings with owner info" ON public.listings;

-- Create safe RPC for public listing details (anonymous access)
CREATE OR REPLACE FUNCTION public.get_public_listing_details(listing_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  price integer,
  price_rupees bigint,
  price_unit text,
  bedrooms text,
  bathrooms text,
  size text,
  size_unit text,
  description text,
  location_address text,
  city text,
  sub_area text,
  district text,
  state text,
  pincode text,
  property_type text,
  transaction_type text,
  media_links text[],
  cover_image_url text,
  youtube_url text,
  latitude double precision,
  longitude double precision,
  google_maps_link text,
  created_at timestamp with time zone,
  is_public boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Only return safe, public information - no user_id or internal fields
  SELECT 
    l.id,
    l.title,
    l.price,
    l.price_rupees,
    l.price_unit,
    l.bedrooms,
    l.bathrooms,
    l.size,
    l.size_unit,
    l.description,
    l.location_address,
    l.city,
    l.sub_area,
    l.district,
    l.state,
    l.pincode,
    l.property_type,
    l.transaction_type,
    l.media_links,
    l.cover_image_url,
    l.youtube_url,
    l.latitude,
    l.longitude,
    l.google_maps_link,
    l.created_at,
    l.is_public
  FROM public.listings l
  WHERE l.id = listing_id 
    AND l.is_public = true 
    AND l.deleted_at IS NULL;
$function$;

-- Create safe RPC for public listings search (anonymous access)
CREATE OR REPLACE FUNCTION public.get_public_listings_by_ids(listing_ids uuid[])
RETURNS TABLE(
  id uuid,
  title text,
  price integer,
  price_rupees bigint,
  price_unit text,
  bedrooms text,
  bathrooms text,
  size text,
  size_unit text,
  city text,
  sub_area text,
  district text,
  state text,
  property_type text,
  transaction_type text,
  cover_image_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return minimal safe data for listing cards
  SELECT 
    l.id,
    l.title,
    l.price,
    l.price_rupees,
    l.price_unit,
    l.bedrooms,
    l.bathrooms,
    l.size,
    l.size_unit,
    l.city,
    l.sub_area,
    l.district,
    l.state,
    l.property_type,
    l.transaction_type,
    l.cover_image_url,
    l.created_at
  FROM public.listings l
  WHERE l.id = ANY(listing_ids)
    AND l.is_public = true 
    AND l.deleted_at IS NULL;
$function$;