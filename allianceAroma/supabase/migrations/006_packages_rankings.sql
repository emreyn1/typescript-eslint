-- Package system columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS package_type TEXT 
  CHECK (package_type IN ('bronze', 'gold', 'diamond'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS package_purchased_at TIMESTAMPTZ;

-- Ranking system columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_rank TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_network_sales DECIMAL(12,2) DEFAULT 0;

-- Updated commission calculation supporting both percentage (product sales) and fixed amount (package sales)
CREATE OR REPLACE FUNCTION public.calculate_commissions(
  p_order_id UUID,
  p_order_total DECIMAL,
  p_is_package_sale BOOLEAN DEFAULT FALSE,
  p_package_type TEXT DEFAULT NULL
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
  v_package_commissions DECIMAL[];
  v_i INT;
  v_existing INT;
BEGIN
  SELECT COUNT(*) INTO v_existing FROM public.commissions WHERE order_id = p_order_id;
  IF v_existing > 0 THEN RETURN; END IF;

  SELECT user_id INTO v_buyer_id FROM public.orders WHERE id = p_order_id;
  IF v_buyer_id IS NULL THEN RETURN; END IF;

  SELECT referrer_path INTO v_referrer_path FROM public.profiles WHERE id = v_buyer_id;
  IF v_referrer_path IS NULL OR LENGTH(TRIM(v_referrer_path)) < 2 THEN RETURN; END IF;

  -- Set package-specific fixed commissions
  IF p_is_package_sale AND p_package_type IS NOT NULL THEN
    CASE p_package_type
      WHEN 'bronze' THEN v_package_commissions := ARRAY[24, 15, 12, 9, 6, 3, 2, 1.5, 1, 0.5];
      WHEN 'gold' THEN v_package_commissions := ARRAY[64, 40, 32, 24, 16, 8, 4, 4, 4, 4];
      WHEN 'diamond' THEN v_package_commissions := ARRAY[104, 65, 52, 39, 26, 13, 6.5, 6.5, 6.5, 6.5];
      ELSE v_package_commissions := NULL;
    END CASE;
  END IF;

  v_path_parts := string_to_array(trim(both '/' from v_referrer_path), '/');
  v_level := 1;
  
  FOR v_i IN REVERSE (array_length(v_path_parts, 1) - 1)..1
  LOOP
    EXIT WHEN v_level > 10;
    BEGIN
      v_ancestor_id := v_path_parts[v_i]::UUID;
      IF v_ancestor_id = v_buyer_id THEN CONTINUE; END IF;

      IF p_is_package_sale AND v_package_commissions IS NOT NULL THEN
        v_commission_amount := v_package_commissions[v_level];
      ELSE
        v_commission_rate := v_level_rates[v_level];
        v_commission_amount := ROUND(p_order_total * v_commission_rate, 2);
      END IF;

      IF v_commission_amount > 0 THEN
        INSERT INTO public.commissions (affiliate_id, order_id, level, amount, order_total, status)
        VALUES (v_ancestor_id, p_order_id, v_level, v_commission_amount, p_order_total, 'pending')
        ON CONFLICT (order_id, level) DO NOTHING;
      END IF;

      v_level := v_level + 1;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.calculate_commissions(UUID, DECIMAL, BOOLEAN, TEXT) FROM anon, authenticated;
