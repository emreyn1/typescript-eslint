-- ============================================
-- Fix infinite recursion in profiles RLS
-- ============================================
-- SAFE: No data is deleted. Only the old RLS policy object is replaced.
-- The DROP POLICY + CREATE POLICY pair preserves the same security intent.

-- Step 1: Helper function that reads own referrer_path bypassing RLS
CREATE OR REPLACE FUNCTION public.get_my_referrer_path()
RETURNS TEXT AS $$
  SELECT referrer_path FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Step 2: Replace recursive downline policy
DROP POLICY IF EXISTS "Users can view downline" ON public.profiles;

CREATE POLICY "Users can view downline" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR referrer_path LIKE COALESCE(public.get_my_referrer_path(), '/' || auth.uid()::TEXT) || '/%'
  );

-- Step 3: RPC to activate affiliate (bypasses RLS entirely)
CREATE OR REPLACE FUNCTION public.activate_affiliate()
RETURNS JSON AS $$
BEGIN
  UPDATE public.profiles
  SET is_affiliate = true
  WHERE id = auth.uid()
    AND is_affiliate = false;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 4: RPC to fetch direct referrals (bypasses RLS, single fast query)
CREATE OR REPLACE FUNCTION public.get_direct_referrals(p_parent_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ,
  package_type TEXT,
  child_count BIGINT
) AS $$
DECLARE
  v_my_path TEXT;
BEGIN
  SELECT referrer_path INTO v_my_path FROM public.profiles WHERE profiles.id = auth.uid();

  IF p_parent_id != auth.uid() THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = p_parent_id
      AND referrer_path LIKE COALESCE(v_my_path, '/' || auth.uid()::TEXT) || '/%'
    ) THEN
      RETURN;
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    p.package_type,
    (SELECT COUNT(*) FROM public.profiles c WHERE c.referrer_id = p.id)
  FROM public.profiles p
  WHERE p.referrer_id = p_parent_id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Step 5: Missing indexes (critical for performance)
CREATE INDEX IF NOT EXISTS profiles_referrer_id_idx ON public.profiles(referrer_id);
CREATE UNIQUE INDEX IF NOT EXISTS commissions_order_level_uniq ON public.commissions(order_id, level);

-- Step 6: Permissions
REVOKE ALL ON FUNCTION public.get_my_referrer_path() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referrer_path() TO authenticated;

REVOKE ALL ON FUNCTION public.activate_affiliate() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.activate_affiliate() TO authenticated;

REVOKE ALL ON FUNCTION public.get_direct_referrals(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_direct_referrals(UUID) TO authenticated;
