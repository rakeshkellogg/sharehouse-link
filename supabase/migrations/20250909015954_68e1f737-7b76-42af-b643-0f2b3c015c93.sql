-- Fix the circular dependency security issue in is_super_admin function
-- This function should ONLY check the user_roles table, not admin_emails
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only check the user_roles table to avoid circular dependency
  -- Remove the admin_emails check that was causing the security issue
  RETURN COALESCE(public.has_role(auth.uid(), 'super_admin'), false);
END;
$function$;

-- Create a separate function for bootstrapping the first admin
-- This function can be called by service role to set up initial admin
CREATE OR REPLACE FUNCTION public.bootstrap_admin_from_email(admin_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id uuid;
BEGIN
  -- Only allow service role to call this function
  IF auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Only service role can bootstrap admins';
  END IF;

  -- Find user by email from auth.users (only service role can access this)
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(admin_email))
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;

  -- Add super_admin role if not already exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add email to admin_emails table if not already exists
  INSERT INTO public.admin_emails (email, note)
  VALUES (LOWER(TRIM(admin_email)), 'Bootstrapped admin user')
  ON CONFLICT (email) DO NOTHING;
END;
$function$;

-- Create a function to safely check if current user's email is in admin_emails
-- This avoids the circular dependency by using a direct approach
CREATE OR REPLACE FUNCTION public.is_email_in_admin_list()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_email text;
BEGIN
  -- Get current user's email from JWT token
  user_email := LOWER(TRIM(auth.jwt() ->> 'email'));
  
  -- Return false if no email
  IF user_email IS NULL OR user_email = '' THEN
    RETURN false;
  END IF;

  -- Check admin_emails table directly (this function has SECURITY DEFINER)
  -- so it bypasses RLS and won't create circular dependency
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails 
    WHERE LOWER(TRIM(email)) = user_email
  );
END;
$function$;

-- Update admin_emails RLS policy to be more explicit and secure
-- Remove the old policy and create a more specific one
DROP POLICY IF EXISTS "Super admins manage admin_emails" ON public.admin_emails;

-- Only users with super_admin role in user_roles can access admin_emails
CREATE POLICY "Only role-based super admins can access admin emails"
ON public.admin_emails
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create policy for service role (for bootstrapping)
CREATE POLICY "Service role can manage admin emails"
ON public.admin_emails
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);