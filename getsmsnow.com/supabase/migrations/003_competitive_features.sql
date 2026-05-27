-- Competitive features: what enterprise SMS sites have that we don't
-- Run in Supabase SQL Editor after 002_enterprise_tables.sql

-- ═══════════════════════════════════════════════════════════════════
-- 1. FAVORITES — users can star frequently used services (sms-activate feature)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL,
  country_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, service_id, country_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 2. WEBHOOK URLs — API users get notified when SMS arrives (sms-activate, 5sim)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS user_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_webhooks_user ON user_webhooks(user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. DEPOSIT HISTORY — separate from balance_transactions for clarity (all competitors)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method TEXT NOT NULL,
  provider_tx_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON deposits(status);

-- ═══════════════════════════════════════════════════════════════════
-- 4. NOTIFICATIONS — email/push when SMS arrives (VerifySMS, 5sim)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  ref_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- ═══════════════════════════════════════════════════════════════════
-- 5. USER NOTIFICATION PREFERENCES (enterprise standard)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_on_sms BOOLEAN DEFAULT true,
  email_on_deposit BOOLEAN DEFAULT true,
  email_on_refund BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- 6. SERVICE STATS — cached success rates & order counts (SMSPool social proof)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS service_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  total_orders INT DEFAULT 0,
  successful_orders INT DEFAULT 0,
  avg_delivery_seconds INT,
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_service_stats_lookup ON service_stats(country_id, service_id);

-- ═══════════════════════════════════════════════════════════════════
-- 7. SUPPORT TICKETS — in-app support (enterprise standard)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);

-- ═══════════════════════════════════════════════════════════════════
-- 8. CASHBACK / LOYALTY — sms-activate has this, major engagement driver
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE users ADD COLUMN IF NOT EXISTS loyalty_tier TEXT DEFAULT 'bronze';
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cashback_balance NUMERIC(12,2) DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════
-- 9. IP RATE LIMIT TRACKING — anti-abuse (enterprise security)
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  hit_count INT DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  UNIQUE(ip_address, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON rate_limits(ip_address, endpoint);
