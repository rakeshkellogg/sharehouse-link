-- Robust fix for signup failing with "permission denied for table profiles"
-- 1) Ensure handle_new_user runs with elevated privileges
-- 2) Ensure trigger exists on auth.users
-- 3) Adjust RLS policy to allow inserts by supabase_auth_admin/service_role

-- 1) Recreate function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 2) Ensure trigger exists (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3) Fix RLS insert policy to allow signup context
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (
  -- Normal app inserts
  auth.uid() = user_id
  OR
  -- Signup trigger context (database role)
  current_setting('role', true) = 'supabase_auth_admin'
  OR current_user = 'supabase_auth_admin'
  OR
  -- Service role usage (e.g., edge functions)
  auth.role() = 'service_role'
);
