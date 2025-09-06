-- Create a security definer function to safely fetch public listings for search
CREATE OR REPLACE FUNCTION public.search_public_listings(search_location text DEFAULT '')
RETURNS TABLE (
  id uuid,
  title text,
  city text,
  sub_area text,
  district text,
  state text,
  location_address text
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.city,
    l.sub_area,
    l.district,
    l.state,
    l.location_address
  FROM listings l
  WHERE l.is_public = true 
    AND l.deleted_at IS NULL
    AND (
      search_location = '' OR
      l.city ILIKE '%' || search_location || '%' OR
      l.sub_area ILIKE '%' || search_location || '%' OR
      l.district ILIKE '%' || search_location || '%' OR
      l.state ILIKE '%' || search_location || '%' OR
      l.location_address ILIKE '%' || search_location || '%'
    )
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;