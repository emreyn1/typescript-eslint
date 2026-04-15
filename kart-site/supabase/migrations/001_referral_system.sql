CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referral_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  code VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id)
);

CREATE TABLE IF NOT EXISTS referral_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID,
  order_id UUID,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  level INT DEFAULT 1,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kart_ref_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_kart_ref_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_kart_ref_links_referrer ON referral_links(referrer_id);
CREATE INDEX IF NOT EXISTS idx_kart_ref_commissions_referrer ON referral_commissions(referrer_id);
