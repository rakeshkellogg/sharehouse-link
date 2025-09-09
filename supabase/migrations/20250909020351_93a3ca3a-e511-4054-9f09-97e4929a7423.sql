-- Add super_admin role for rakesh.nw.kellogg@gmail.com
-- First, get the user ID and add the role
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE LOWER(TRIM(email)) = 'rakesh.nw.kellogg@gmail.com'
  LIMIT 1;

  IF target_user_id IS NOT NULL THEN
    -- Add super_admin role if not already exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Super admin role added for user %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email rakesh.nw.kellogg@gmail.com not found';
  END IF;
END $$;