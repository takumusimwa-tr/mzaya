-- Batch 08.6.1 — Live codebase merge corrections.
-- Safe additive columns only; domain table creation remains in earlier migrations.

ALTER TABLE payment_attempts
  ADD COLUMN IF NOT EXISTS finance_reconciliation_status VARCHAR(30)
    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS finance_last_reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finance_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS finance_reconciliation_status VARCHAR(30)
    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS finance_last_reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finance_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;
