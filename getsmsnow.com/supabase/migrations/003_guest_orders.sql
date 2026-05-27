-- Guest orders: pay-per-order without registration
CREATE TABLE IF NOT EXISTS guest_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_token TEXT UNIQUE NOT NULL,
  country_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  amount DECIMAL(12, 4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, active, completed, cancelled
  phone_number TEXT,
  smspool_order_id TEXT,
  email TEXT,
  payment_provider TEXT NOT NULL, -- cryptomus, paddle
  payment_order_id TEXT,          -- Cryptomus order_id or Paddle transaction_id
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guest_orders_token ON guest_orders(guest_token);
CREATE INDEX idx_guest_orders_payment ON guest_orders(payment_provider, payment_order_id);
CREATE INDEX idx_guest_orders_status ON guest_orders(status);
