-- Create user_blocks table with normalized pair storage
CREATE TABLE public.user_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  created_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  removed_at TIMESTAMP WITH TIME ZONE NULL,
  CONSTRAINT user_blocks_no_self_block CHECK (user_a != user_b)
);

-- Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Create unique constraint for active blocks only (normalized pairs)
CREATE UNIQUE INDEX user_blocks_pair_active_uidx 
  ON public.user_blocks (least(user_a, user_b), greatest(user_a, user_b))
  WHERE removed_at IS NULL;

-- Create hardened is_blocked function with security definer
CREATE OR REPLACE FUNCTION public.is_blocked(a uuid, b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_blocks ub
    WHERE least(ub.user_a, ub.user_b) = least(a, b)
      AND greatest(ub.user_a, ub.user_b) = greatest(a, b)
      AND ub.removed_at IS NULL
  );
$$;

-- Grant execute permission to authenticated users only
REVOKE ALL ON FUNCTION public.is_blocked(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) TO authenticated;

-- RLS policies for user_blocks
CREATE POLICY "Users can view blocks they are involved in"
ON public.user_blocks
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_a OR auth.uid() = user_b)
  AND NOT is_user_suspended()
);

CREATE POLICY "Users can create blocks they initiate"
ON public.user_blocks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND auth.uid() = user_a
  AND NOT is_user_suspended()
);

CREATE POLICY "Users can soft delete blocks they created"
ON public.user_blocks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
  AND NOT is_user_suspended()
);

-- Extend reports table with new columns
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS reported_user_id UUID;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS details TEXT;

-- Make listing_id nullable and add check constraint
ALTER TABLE public.reports ALTER COLUMN listing_id DROP NOT NULL;
ALTER TABLE public.reports ADD CONSTRAINT reports_target_ck 
  CHECK (reported_user_id IS NOT NULL OR listing_id IS NOT NULL);

-- Make category required
ALTER TABLE public.reports ALTER COLUMN category SET NOT NULL;

-- Replace existing reports RLS policies with enhanced ones
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
DROP POLICY IF EXISTS "Super admins can manage all reports" ON public.reports;

CREATE POLICY "Users can create their own reports"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = reporter_user_id
  AND NOT is_user_suspended()
);

CREATE POLICY "Users can view their own reports; admins can view all"
ON public.reports
FOR SELECT
TO authenticated
USING (
  reporter_user_id = auth.uid()
  OR is_super_admin()
);

CREATE POLICY "Admins can manage all reports"
ON public.reports
FOR ALL
TO authenticated
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Replace messages INSERT policy to include block checking
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;

CREATE POLICY "Users can create messages if not blocked"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_user_id
  AND NOT is_user_suspended()
  AND NOT public.is_blocked(sender_user_id, owner_user_id)
);