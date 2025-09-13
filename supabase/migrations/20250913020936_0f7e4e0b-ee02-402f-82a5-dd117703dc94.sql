-- Enable Row Level Security on public_listings table
ALTER TABLE public.public_listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only authenticated users to read public listings
CREATE POLICY "Authenticated users can view public listings" 
ON public.public_listings 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- If this is a view that should be publicly readable but controlled, 
-- you might want a different policy. But for now, let's secure it.

-- Optional: If you want to completely restrict this table to admin use only:
-- CREATE POLICY "Only admins can access public listings table" 
-- ON public.public_listings 
-- FOR ALL 
-- USING (is_super_admin());