-- Fix the function search path warning
DROP FUNCTION IF EXISTS public.user_can_see_contact_info(uuid);

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