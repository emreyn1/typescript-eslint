-- GetSMSNow: Initial schema for users, orders, balance, referrals, verification codes

-- Users (extends NextAuth sessions; we sync from auth providers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  name TEXT,
  image TEXT,
  password_hash TEXT,
  balance DECIMAL(12, 4) DEFAULT 0 NOT NULL,
  referral_code TEXT UNIQUE,
  telegram_id TEXT UNIQUE,
  google_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);

-- Referrals: who referred whom
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Orders: SMS purchases
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  smspool_order_id TEXT NOT NULL,
  country_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  amount DECIMAL(12, 4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_smspool ON orders(smspool_order_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Balance transactions: topup, spend, refund
CREATE TABLE IF NOT EXISTS balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- topup, spend, refund
  amount DECIMAL(12, 4) NOT NULL,
  ref_id TEXT, -- order_id, cryptomus_order_id, etc.
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_balance_transactions_user ON balance_transactions(user_id);
CREATE INDEX idx_balance_transactions_ref ON balance_transactions(ref_id);

-- Verification codes for email signup/login
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  used BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);

-- Cryptomus payment tracking (to avoid double-credit)
CREATE TABLE IF NOT EXISTS cryptomus_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 4) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_cryptomus_payments_order ON cryptomus_payments(order_id);
CREATE INDEX idx_cryptomus_payments_user ON cryptomus_payments(user_id);

-- Telegram login: one-time tokens from widget verification
CREATE TABLE IF NOT EXISTS telegram_login_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  telegram_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_telegram_login_tokens_token ON telegram_login_tokens(token);
