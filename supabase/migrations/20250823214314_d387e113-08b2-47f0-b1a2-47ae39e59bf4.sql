-- Add new fields to listings table for YouTube video and cover photo
ALTER TABLE public.listings 
ADD COLUMN youtube_url TEXT,
ADD COLUMN cover_image_url TEXT,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create messages table for peer-to-peer messaging
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT messages_body_length CHECK (length(body) <= 300),
  CONSTRAINT messages_word_count CHECK (array_length(string_to_array(trim(body), ' '), 1) <= 50)
);

-- Enable RLS on messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view messages they sent" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Listing owners can view messages for their listings" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Listing owners can update read status" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = owner_user_id);

-- Create index for better performance
CREATE INDEX idx_messages_listing_id ON public.messages(listing_id);
CREATE INDEX idx_messages_owner_user_id ON public.messages(owner_user_id);
CREATE INDEX idx_messages_sender_user_id ON public.messages(sender_user_id);

-- Update existing listings RLS policy to exclude soft deleted listings
DROP POLICY "Public can view public listings" ON public.listings;

CREATE POLICY "Public can view public listings" 
ON public.listings 
FOR SELECT 
USING (is_public AND deleted_at IS NULL);

-- Update user's own listings policy
DROP POLICY "Users can view their own listings" ON public.listings;

CREATE POLICY "Users can view their own listings" 
ON public.listings 
FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);