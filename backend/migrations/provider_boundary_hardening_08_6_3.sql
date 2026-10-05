-- Batch 08.6.3 — Provider Boundary Hardening, Concurrency & Failure Injection

CREATE TABLE IF NOT EXISTS provider_callback_receipts (
  id UUID PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  callback_key VARCHAR(220) NOT NULL UNIQUE,
  payment_id UUID REFERENCES payment_attempts(id) ON DELETE SET NULL,
  outcome VARCHAR(30),
  raw_status VARCHAR(120),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS provider_callback_receipts_provider_payment_idx
  ON provider_callback_receipts(provider, payment_id);

ALTER TABLE finance_outbox_events ADD COLUMN IF NOT EXISTS worker_id VARCHAR(120);
