-- Add India-specific location fields to listings table
ALTER TABLE public.listings 
ADD COLUMN sub_area text,
ADD COLUMN sub_area_slug text,
ADD COLUMN district text;

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_listings_sub_area_slug ON public.listings(sub_area_slug) WHERE sub_area_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_pincode ON public.listings(pincode) WHERE pincode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_state ON public.listings(state) WHERE state IS NOT NULL;

-- Create a composite index for location-based searches
CREATE INDEX IF NOT EXISTS idx_listings_location_search ON public.listings(sub_area_slug, city, pincode, state) WHERE is_public = true AND deleted_at IS NULL;