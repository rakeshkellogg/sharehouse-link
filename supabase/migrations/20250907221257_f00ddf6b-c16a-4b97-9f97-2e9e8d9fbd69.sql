-- Function to check if current user is suspended
CREATE OR REPLACE FUNCTION public.is_user_suspended()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND suspended_at IS NOT NULL
  );
$$;

-- Update listings policies to exclude suspended users
DROP POLICY IF EXISTS "Users can view their own listings" ON public.listings;
CREATE POLICY "Users can view their own listings" 
ON public.listings 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND deleted_at IS NULL
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can create their own listings" ON public.listings;
CREATE POLICY "Users can create their own listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can update their own listings" ON public.listings;
CREATE POLICY "Users can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can delete their own listings" ON public.listings;
CREATE POLICY "Users can delete their own listings" 
ON public.listings 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

-- Update messages policies to exclude suspended users
DROP POLICY IF EXISTS "Users can view messages they sent" ON public.messages;
CREATE POLICY "Users can view messages they sent" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() = sender_user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Listing owners can view messages for their listings" ON public.messages;
CREATE POLICY "Listing owners can view messages for their listings" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() = owner_user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
CREATE POLICY "Users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Listing owners can update read status" ON public.messages;
CREATE POLICY "Listing owners can update read status" 
ON public.messages 
FOR UPDATE 
USING (
  auth.uid() = owner_user_id 
  AND NOT public.is_user_suspended()
);

-- Update saved_listings policies to exclude suspended users
DROP POLICY IF EXISTS "Users can view their own saved listings" ON public.saved_listings;
CREATE POLICY "Users can view their own saved listings" 
ON public.saved_listings 
FOR SELECT 
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can save listings" ON public.saved_listings;
CREATE POLICY "Users can save listings" 
ON public.saved_listings 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

DROP POLICY IF EXISTS "Users can remove their saved listings" ON public.saved_listings;
CREATE POLICY "Users can remove their saved listings" 
ON public.saved_listings 
FOR DELETE 
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

-- Update profiles policies to exclude suspended users from updating their profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id 
  AND NOT public.is_user_suspended()
);

-- Grant execute permission on the helper function
GRANT EXECUTE ON FUNCTION public.is_user_suspended() TO authenticated;