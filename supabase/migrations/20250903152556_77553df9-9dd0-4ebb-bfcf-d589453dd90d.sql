-- Check and fix the security definer function that's causing the linter error
-- Let's recreate the function without security definer if that's the issue

-- Drop and recreate the function without security definer
DROP FUNCTION IF EXISTS public.user_can_see_contact_info(uuid);

-- Create the function without security definer property to fix linter warning
CREATE OR REPLACE FUNCTION public.user_can_see_contact_info(listing_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
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