-- PHASE 1: Super Admin Foundation

-- 1) Create app_role enum (handle existing type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('super_admin', 'moderator', 'user');
  END IF;
END$$;

-- 2) Admin emails table
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3) User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 4) Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Super admin detection function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  user_email := (auth.jwt() ->> 'email');
  
  RETURN COALESCE(public.has_role(auth.uid(), 'super_admin'), false)
    OR COALESCE(
      (SELECT EXISTS (SELECT 1 FROM public.admin_emails WHERE email = user_email)),
      false
    );
END;
$$;

-- 5) Enable RLS and create policies
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Admin emails policies
DROP POLICY IF EXISTS "Super admins manage admin_emails" ON public.admin_emails;
CREATE POLICY "Super admins manage admin_emails"
ON public.admin_emails FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- User roles policies  
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins manage all roles" ON public.user_roles;
CREATE POLICY "Super admins manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- 6) Add your email as super admin
INSERT INTO public.admin_emails (email, note) 
VALUES ('RAKESH.NW.KELLOGG@GMAIL.COM', 'Project owner - auto super admin access')
ON CONFLICT (email) DO NOTHING;