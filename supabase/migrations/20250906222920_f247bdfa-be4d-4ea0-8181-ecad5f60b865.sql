-- Create app_settings table for persistent configuration
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.app_settings(key, value) VALUES
  ('max_listings_per_user', '10'::jsonb),
  ('max_images_per_listing', '12'::jsonb),
  ('message_rate_per_day', '50'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('allow_new_registrations', 'true'::jsonb),
  ('require_email_verification', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add suspended_at column to profiles if missing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at timestamptz;

-- RPC to get admin statistics (secure)
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE
    WHEN public.is_super_admin() THEN
      jsonb_build_object(
        'users_total', (SELECT count(*) FROM public.profiles),
        'listings_total', (SELECT count(*) FROM public.listings WHERE deleted_at IS NULL),
        'public_listings', (SELECT count(*) FROM public.listings WHERE is_public = true AND deleted_at IS NULL),
        'messages_7d', (SELECT count(*) FROM public.messages WHERE created_at > now() - interval '7 days'),
        'new_users_7d', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
        'reports_open', 0::bigint,
        'messages_today', (SELECT count(*) FROM public.messages WHERE created_at::date = CURRENT_DATE)
      )
    ELSE NULL::jsonb
  END;
$$;

GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO authenticated;

-- RPC to read all settings
CREATE OR REPLACE FUNCTION public.read_settings()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb) FROM public.app_settings;
$$;

GRANT EXECUTE ON FUNCTION public.read_settings() TO authenticated;

-- RPC to write one setting (admin only)
CREATE OR REPLACE FUNCTION public.write_setting(k text, v jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  INSERT INTO public.app_settings(key, value, updated_at)
  VALUES (k, v, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.write_setting(text, jsonb) TO authenticated;

-- RPC to suspend/unsuspend user (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_user_suspension(p_user_id uuid, p_suspend boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  UPDATE public.profiles
  SET suspended_at = CASE WHEN p_suspend THEN now() ELSE NULL END
  WHERE user_id = p_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_suspension(uuid, boolean) TO authenticated;

-- RPC to manage listing visibility and deletion (admin only)
CREATE OR REPLACE FUNCTION public.admin_set_listing(
  p_listing_id uuid,
  p_is_public boolean DEFAULT NULL,
  p_soft_delete boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges';
  END IF;

  IF p_is_public IS NOT NULL THEN
    UPDATE public.listings 
    SET is_public = p_is_public, updated_at = now() 
    WHERE id = p_listing_id;
  END IF;

  IF p_soft_delete IS NOT NULL THEN
    UPDATE public.listings
    SET deleted_at = CASE WHEN p_soft_delete THEN now() ELSE NULL END,
        updated_at = now()
    WHERE id = p_listing_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_listing(uuid, boolean, boolean) TO authenticated;