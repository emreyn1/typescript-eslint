-- Add password_hash and referral_code to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add FK constraints to referral tables
ALTER TABLE referral_codes
  ADD CONSTRAINT fk_ref_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referral_links
  ADD CONSTRAINT fk_ref_links_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referral_links
  ADD CONSTRAINT fk_ref_links_referred FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE referral_commissions
  ADD CONSTRAINT fk_ref_comm_referrer FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE;
