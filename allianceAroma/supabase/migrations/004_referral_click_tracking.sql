-- Allow anyone (including anonymous visitors) to insert referral clicks
CREATE POLICY "Anyone can track referral clicks" ON public.referral_clicks
  FOR INSERT WITH CHECK (true);

-- Secure function for public referral code lookup
-- Exposes only id and name (not email) via SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.get_referrer_info(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object('id', id, 'name', full_name)
  INTO v_result
  FROM public.profiles
  WHERE UPPER(TRIM(referral_code)) = UPPER(TRIM(p_code))
    AND referral_code IS NOT NULL
  LIMIT 1;

  RETURN COALESCE(v_result, '{}' ::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
