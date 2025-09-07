-- Fix RLS policy for profile creation during signup
-- The current policy prevents the trigger from creating profiles for new users

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create a new policy that allows both authenticated users and the signup trigger
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  -- Allow during signup process when auth.uid() might not be set yet
  current_setting('role') = 'supabase_auth_admin'
);