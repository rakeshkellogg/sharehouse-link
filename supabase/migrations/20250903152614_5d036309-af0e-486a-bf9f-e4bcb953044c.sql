-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.user_can_see_contact_info(listing_id uuid)
RETURNS boolean
LANGUAGE sql
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

-- Check if there are any existing functions with security definer that need to be fixed
-- Let's check existing functions that might have security definer and fix them

-- Fix the handle_new_user function if it exists with security definer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

-- Fix the set_updated_at function if it exists with security definer  
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;