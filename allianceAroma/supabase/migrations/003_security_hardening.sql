-- ============================================
-- Security Hardening Migration
-- ============================================

-- ============================================
-- 1. LOCK DOWN calculate_commissions
--    Only callable by service_role (webhooks).
--    Regular users MUST NOT call this directly.
-- ============================================
REVOKE EXECUTE ON FUNCTION public.calculate_commissions(UUID, DECIMAL) FROM anon, authenticated;

-- ============================================
-- 2. Add duplicate commission prevention
--    One commission per order per level, enforced at DB level.
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS commissions_order_level_unique
  ON public.commissions(order_id, level);

-- ============================================
-- 3. Update calculate_commissions to check for existing commissions
--    and use ON CONFLICT to be idempotent
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_commissions(
  p_order_id UUID,
  p_order_total DECIMAL
)
RETURNS void AS $$
DECLARE
  v_buyer_id UUID;
  v_referrer_path TEXT;
  v_path_parts TEXT[];
  v_ancestor_id UUID;
  v_level INT;
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_level_rates DECIMAL[] := ARRAY[0.10, 0.05, 0.03, 0.02, 0.02, 0.01, 0.01, 0.01, 0.01, 0.01];
  v_i INT;
  v_existing INT;
BEGIN
  -- Check if commissions already exist for this order
  SELECT COUNT(*) INTO v_existing
  FROM public.commissions WHERE order_id = p_order_id;

  IF v_existing > 0 THEN
    RETURN;
  END IF;

  SELECT user_id INTO v_buyer_id FROM public.orders WHERE id = p_order_id;

  IF v_buyer_id IS NULL THEN
    RETURN;
  END IF;

  SELECT referrer_path INTO v_referrer_path FROM public.profiles WHERE id = v_buyer_id;

  IF v_referrer_path IS NULL OR LENGTH(TRIM(v_referrer_path)) < 2 THEN
    RETURN;
  END IF;

  v_path_parts := string_to_array(trim(both '/' from v_referrer_path), '/');

  v_level := 1;
  FOR v_i IN REVERSE (array_length(v_path_parts, 1) - 1)..1
  LOOP
    EXIT WHEN v_level > 10;
    BEGIN
      v_ancestor_id := v_path_parts[v_i]::UUID;
      IF v_ancestor_id = v_buyer_id THEN
        CONTINUE;
      END IF;

      v_commission_rate := v_level_rates[v_level];
      v_commission_amount := ROUND(p_order_total * v_commission_rate, 2);

      IF v_commission_amount > 0 THEN
        INSERT INTO public.commissions (affiliate_id, order_id, level, amount, order_total, status)
        VALUES (v_ancestor_id, p_order_id, v_level, v_commission_amount, p_order_total, 'pending')
        ON CONFLICT (order_id, level) DO NOTHING;
      END IF;

      v_level := v_level + 1;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply REVOKE after CREATE OR REPLACE (which resets permissions)
REVOKE EXECUTE ON FUNCTION public.calculate_commissions(UUID, DECIMAL) FROM anon, authenticated;

-- ============================================
-- 4. Function to cancel commissions on refund
-- ============================================
CREATE OR REPLACE FUNCTION public.cancel_order_commissions(
  p_order_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE public.commissions
  SET status = 'cancelled'
  WHERE order_id = p_order_id
    AND status IN ('pending', 'processing');

  UPDATE public.orders
  SET status = 'cancelled'
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.cancel_order_commissions(UUID) FROM anon, authenticated;

-- ============================================
-- 5. Fix downline LIKE pattern to prevent partial UUID matches
--    Old: referrer_path LIKE '/A_UUID%' could match '/A_UUID_SOMETHING'
--    New: requires exact path segment boundary
-- ============================================
DROP POLICY IF EXISTS "Users can view downline" ON public.profiles;

CREATE POLICY "Users can view downline" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR referrer_path LIKE (
      SELECT COALESCE(referrer_path, '/' || auth.uid()::TEXT) || '/%'
      FROM public.profiles WHERE id = auth.uid() LIMIT 1
    )
  );
