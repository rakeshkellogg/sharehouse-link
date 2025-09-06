-- Enable RLS on app_settings table and create policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can manage app settings
CREATE POLICY "Super admins can manage app settings"
ON public.app_settings
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Policy: Authenticated users can read settings (for general app behavior)
CREATE POLICY "Authenticated users can read settings"
ON public.app_settings
FOR SELECT
TO authenticated
USING (true);