-- Mzaya Batch 08.6.6D.7
-- Treasury transfer contract convergence.
--
-- Purpose:
--   Preserve the 08.5.6 finance/event compatibility fields while retaining the
--   08.3.2 bank-to-bank/FX execution contract. New application code writes the
--   canonical bank/FX fields and compatibility fields together where possible.
--
-- Safety:
--   * Schema-only; no historical row rewrite/backfill.
--   * No provider/bank calls and no external money movement.
--   * Newer bank/FX columns are made nullable because external/manual treasury
--     transfers (for example tax remittance) may not have two internal bank
--     accounts. Explicit execution validates the bank-to-bank contract in code.

ALTER TABLE treasury_transfers
  ADD COLUMN IF NOT EXISTS source_account_id UUID,
  ADD COLUMN IF NOT EXISTS destination_account_id UUID,
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3),
  ADD COLUMN IF NOT EXISTS amount_minor BIGINT,
  ADD COLUMN IF NOT EXISTS provider VARCHAR(60),
  ADD COLUMN IF NOT EXISTS provider_reference VARCHAR(180),
  ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS finance_reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS finance_last_reconciled_at TIMESTAMPTZ;

-- The 08.3.2 contract assumed every transfer was an internal bank-to-bank
-- movement. The application also supports provider/manual transfers whose
-- destination is external. Keep those rows representable; the execution
-- service rejects incomplete bank-to-bank execution contracts before any
-- provider boundary is reached.
ALTER TABLE treasury_transfers
  ALTER COLUMN from_bank_account_id DROP NOT NULL,
  ALTER COLUMN to_bank_account_id DROP NOT NULL,
  ALTER COLUMN source_currency DROP NOT NULL,
  ALTER COLUMN destination_currency DROP NOT NULL,
  ALTER COLUMN source_amount_minor DROP NOT NULL,
  ALTER COLUMN destination_amount_minor DROP NOT NULL;

CREATE INDEX IF NOT EXISTS treasury_transfers_finance_reconciliation_idx
  ON treasury_transfers(finance_reconciliation_status, completed_at DESC);
