-- ============================================
-- Self-Referral Protection & Anti-Abuse
-- ============================================

-- Registration IP tracking for anti-abuse
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS registration_ip_hash TEXT,
  ADD COLUMN IF NOT EXISTS last_login_ip_hash TEXT;

CREATE INDEX IF NOT EXISTS profiles_registration_ip_hash_idx
  ON public.profiles(registration_ip_hash)
  WHERE registration_ip_hash IS NOT NULL;

-- ============================================
-- Self-referral check on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.check_self_referral()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_code TEXT;
  v_referrer_email TEXT;
BEGIN
  v_referral_code := NEW.raw_user_meta_data->>'referral_code';

  IF v_referral_code IS NULL OR TRIM(v_referral_code) = '' THEN
    RETURN NEW;
  END IF;

  SELECT p.email INTO v_referrer_email
  FROM public.profiles p
  WHERE UPPER(TRIM(p.referral_code)) = UPPER(TRIM(v_referral_code))
  LIMIT 1;

  IF v_referrer_email IS NOT NULL THEN
    IF LOWER(TRIM(NEW.email)) = LOWER(TRIM(v_referrer_email)) THEN
      RAISE EXCEPTION 'Self-referral is not allowed';
    END IF;

    -- Block plus-addressing abuse (user+tag@gmail.com)
    IF split_part(LOWER(TRIM(NEW.email)), '+', 1) || '@' ||
       split_part(LOWER(TRIM(NEW.email)), '@', 2) =
       split_part(LOWER(TRIM(v_referrer_email)), '+', 1) || '@' ||
       split_part(LOWER(TRIM(v_referrer_email)), '@', 2) THEN
      RAISE EXCEPTION 'Self-referral is not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS check_self_referral_trigger ON auth.users;
CREATE TRIGGER check_self_referral_trigger
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.check_self_referral();

-- ============================================
-- Protect referral fields from user manipulation
-- When referrer_id is NULL: allow setting both referrer_id and referrer_path (late-linking for OAuth)
-- When referrer_id is set: lock both referrer_id and referrer_path (anti-abuse)
-- referral_code is always locked once set
-- ============================================
CREATE OR REPLACE FUNCTION public.protect_referral_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- referrer_id already set → lock referrer_id and referrer_path
  IF OLD.referrer_id IS NOT NULL THEN
    IF OLD.referrer_id IS DISTINCT FROM NEW.referrer_id THEN
      NEW.referrer_id := OLD.referrer_id;
    END IF;
    IF OLD.referrer_path IS DISTINCT FROM NEW.referrer_path THEN
      NEW.referrer_path := OLD.referrer_path;
    END IF;
  END IF;
  -- referral_code is always immutable once set
  IF OLD.referral_code IS NOT NULL AND OLD.referral_code IS DISTINCT FROM NEW.referral_code THEN
    NEW.referral_code := OLD.referral_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS protect_referral_fields_trigger ON public.profiles;
CREATE TRIGGER protect_referral_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_referral_fields();

-- ============================================
-- Late-link referral for OAuth users
-- Called from server after OAuth signup when
-- the referral code couldn't be passed via metadata
-- ============================================
CREATE OR REPLACE FUNCTION public.link_referral_to_user(
  p_user_id UUID,
  p_referral_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_referrer_id UUID;
  v_referrer_path TEXT;
  v_current_referrer UUID;
  v_new_path TEXT;
  v_path_parts TEXT[];
  v_path_len INT;
  v_referrer_email TEXT;
  v_user_email TEXT;
BEGIN
  -- Security: only allow users to link their own profile
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RETURN json_build_object('linked', false, 'reason', 'unauthorized');
  END IF;

  -- Already has a referrer? Skip
  SELECT referrer_id, email INTO v_current_referrer, v_user_email
  FROM public.profiles WHERE id = p_user_id;

  IF v_current_referrer IS NOT NULL THEN
    RETURN json_build_object('linked', false, 'reason', 'already_linked');
  END IF;

  -- Find referrer by code
  SELECT id, referrer_path, email
  INTO v_referrer_id, v_referrer_path, v_referrer_email
  FROM public.profiles
  WHERE UPPER(TRIM(referral_code)) = UPPER(TRIM(p_referral_code))
    AND id != p_user_id
  LIMIT 1;

  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('linked', false, 'reason', 'invalid_code');
  END IF;

  -- Self-referral check (plus-addressing)
  IF split_part(LOWER(TRIM(v_user_email)), '+', 1) || '@' ||
     split_part(LOWER(TRIM(v_user_email)), '@', 2) =
     split_part(LOWER(TRIM(v_referrer_email)), '+', 1) || '@' ||
     split_part(LOWER(TRIM(v_referrer_email)), '@', 2) THEN
    RETURN json_build_object('linked', false, 'reason', 'self_referral');
  END IF;

  -- Build referrer_path
  v_referrer_path := COALESCE(NULLIF(TRIM(v_referrer_path), ''), '/' || v_referrer_id::TEXT);
  v_new_path := v_referrer_path || '/' || p_user_id::TEXT;

  v_path_parts := string_to_array(trim(both '/' from v_new_path), '/');
  v_path_len := array_length(v_path_parts, 1);
  IF v_path_len > 11 THEN
    v_new_path := '/' || array_to_string(v_path_parts[v_path_len - 10 : v_path_len], '/');
  END IF;

  -- Update profile (protect trigger allows NULL → value)
  UPDATE public.profiles
  SET referrer_id = v_referrer_id,
      referrer_path = v_new_path
  WHERE id = p_user_id
    AND referrer_id IS NULL;

  RETURN json_build_object('linked', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Webhook idempotency: prevent duplicate orders
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_payment_id_key
  ON public.orders(stripe_payment_id)
  WHERE stripe_payment_id IS NOT NULL;

-- ============================================
-- order_items: make product_id nullable
-- (products are currently in local mock data,
-- will be migrated to DB in a future migration)
-- ============================================
ALTER TABLE public.order_items
  ALTER COLUMN product_id DROP NOT NULL;
