-- Fix admin email comparison and RLS security issues

-- First, update the is_super_admin function to normalize email comparison
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  user_email := LOWER(TRIM(auth.jwt() ->> 'email'));
  
  RETURN COALESCE(public.has_role(auth.uid(), 'super_admin'), false)
    OR COALESCE(
      (SELECT EXISTS (SELECT 1 FROM public.admin_emails WHERE LOWER(TRIM(email)) = user_email)),
      false
    );
END;
$function$;

-- Upsert the admin email in lowercase
INSERT INTO public.admin_emails (email, note) 
VALUES ('rakesh.nw.kellogg@gmail.com', 'Super admin - normalized email')
ON CONFLICT (email) DO NOTHING;

-- Create a secure RPC function to get public listing details
CREATE OR REPLACE FUNCTION public.get_public_listing(listing_id uuid)
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

-- Drop the problematic RLS policy that was causing security warnings
DROP POLICY IF EXISTS "Anonymous users can view public listings without owner info" ON public.listings;