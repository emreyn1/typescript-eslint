-- NOWPayments IPN webhook transaction log (idempotency + audit)
CREATE TABLE IF NOT EXISTS nowpayments_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  price_amount NUMERIC(12,2) DEFAULT 0,
  price_currency TEXT DEFAULT 'usd',
  pay_amount NUMERIC(18,8) DEFAULT 0,
  pay_currency TEXT DEFAULT '',
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nowpay_tx_payment_id ON nowpayments_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_nowpay_tx_order_id ON nowpayments_transactions(order_id);
