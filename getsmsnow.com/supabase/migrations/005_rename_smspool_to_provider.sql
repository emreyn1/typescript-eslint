-- Migration: Rename smspool_order_id to provider_order_id
-- Supports switching from SMSPool to SMSCode (or any future provider)

ALTER TABLE orders
  RENAME COLUMN smspool_order_id TO provider_order_id;

ALTER TABLE guest_orders
  RENAME COLUMN smspool_order_id TO provider_order_id;

-- Rebuild indexes if they reference the old column name
DROP INDEX IF EXISTS idx_orders_smspool_order_id;
DROP INDEX IF EXISTS idx_guest_orders_smspool_order_id;

CREATE INDEX IF NOT EXISTS idx_orders_provider_order_id
  ON orders(provider_order_id);

CREATE INDEX IF NOT EXISTS idx_guest_orders_provider_order_id
  ON guest_orders(provider_order_id);
