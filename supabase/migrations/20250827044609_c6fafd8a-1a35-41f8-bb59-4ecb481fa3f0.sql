-- Create saved_listings table for users to save listings they're interested in
CREATE TABLE public.saved_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Enable Row Level Security
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for saved listings
CREATE POLICY "Users can view their own saved listings" 
ON public.saved_listings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings" 
ON public.saved_listings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their saved listings" 
ON public.saved_listings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_saved_listings_user_id ON public.saved_listings(user_id);
CREATE INDEX idx_saved_listings_listing_id ON public.saved_listings(listing_id);