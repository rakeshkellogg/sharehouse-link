-- Enable RLS on public_listings table
ALTER TABLE public.public_listings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to public listings (for search functionality)
CREATE POLICY "Allow public read access to public listings" 
ON public.public_listings 
FOR SELECT 
USING (true);

-- Prevent any modifications to public_listings (seems like a read-only table)
CREATE POLICY "Prevent modifications to public_listings" 
ON public.public_listings 
FOR ALL 
USING (false);