-- PrivacyCards Core Schema
-- Run BEFORE 001_referral_system.sql

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  balance NUMERIC(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  provider_card_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT,
  last_four TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  provider TEXT NOT NULL,
  provider_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON payments(provider_id);

CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  ref_id TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_balance_tx_user ON balance_transactions(user_id);

-- Balance RPCs used by the webhook and cards API
CREATE OR REPLACE FUNCTION add_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET balance = balance + p_amount, updated_at = NOW() WHERE id = p_user_id;
  INSERT INTO balance_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'topup', p_amount, 'NOWPayments crypto top-up');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION deduct_balance(p_user_id UUID, p_amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET balance = balance - p_amount, updated_at = NOW()
  WHERE id = p_user_id AND balance >= p_amount;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  INSERT INTO balance_transactions (user_id, type, amount, description)
  VALUES (p_user_id, 'purchase', -p_amount, 'Card purchase');
END;
$$ LANGUAGE plpgsql;
