-- Fix RLS policy for profile creation during signup
-- The issue is that current_setting('role') might not work as expected
-- We need to allow the auth trigger to insert profiles

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that properly allows the signup trigger
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  -- Allow when executed by auth system (during signup trigger)
  auth.role() = 'supabase_auth_admin' OR
  current_user = 'supabase_auth_admin'
);