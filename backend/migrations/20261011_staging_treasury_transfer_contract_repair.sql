-- Mzaya Batch 08.6.6D.5A
-- Phase-1 staging compatibility repair for the verified-empty legacy treasury_transfers table.
-- Purpose: remove legacy columns that block treasury_fx_cash_pooling.sql and add only
-- prerequisites that already exist before that migration creates treasury_fx_rates.
-- Safety: aborts if treasury_transfers contains any row. No external money movement occurs.

DO $$
BEGIN
  IF to_regclass('public.treasury_transfers') IS NULL THEN
    RAISE EXCEPTION 'treasury_transfers does not exist; refusing repair';
  END IF;

  IF EXISTS (SELECT 1 FROM public.treasury_transfers LIMIT 1) THEN
    RAISE EXCEPTION 'treasury_transfers contains rows; refusing destructive repair';
  END IF;

  IF to_regclass('public.bank_accounts') IS NULL THEN
    RAISE EXCEPTION 'bank_accounts does not exist; treasury_cash_management prerequisite is missing';
  END IF;
END $$;

DROP INDEX IF EXISTS treasury_transfers_status_idx;

ALTER TABLE treasury_transfers
  DROP COLUMN IF EXISTS source_account_id,
  DROP COLUMN IF EXISTS destination_account_id,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS amount_minor,
  DROP COLUMN IF EXISTS provider,
  DROP COLUMN IF EXISTS provider_reference,
  DROP COLUMN IF EXISTS initiated_by,
  DROP COLUMN IF EXISTS initiated_at,
  DROP COLUMN IF EXISTS finance_reconciliation_status,
  DROP COLUMN IF EXISTS finance_last_reconciled_at;

ALTER TABLE treasury_transfers
  ADD COLUMN IF NOT EXISTS from_bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS to_bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS source_currency VARCHAR(3),
  ADD COLUMN IF NOT EXISTS destination_currency VARCHAR(3),
  ADD COLUMN IF NOT EXISTS source_amount_minor BIGINT,
  ADD COLUMN IF NOT EXISTS destination_amount_minor BIGINT,
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS failure_reason VARCHAR(1000);

ALTER TABLE treasury_transfers
  ALTER COLUMN from_bank_account_id SET NOT NULL,
  ALTER COLUMN to_bank_account_id SET NOT NULL,
  ALTER COLUMN source_currency SET NOT NULL,
  ALTER COLUMN destination_currency SET NOT NULL,
  ALTER COLUMN source_amount_minor SET NOT NULL,
  ALTER COLUMN destination_amount_minor SET NOT NULL,
  ALTER COLUMN requested_at SET NOT NULL;

ALTER TABLE treasury_transfers
  ADD CONSTRAINT treasury_transfers_source_amount_positive CHECK (source_amount_minor > 0),
  ADD CONSTRAINT treasury_transfers_destination_amount_positive CHECK (destination_amount_minor > 0),
  ADD CONSTRAINT treasury_transfers_distinct_bank_accounts CHECK (from_bank_account_id <> to_bank_account_id);

CREATE INDEX IF NOT EXISTS treasury_transfers_status_idx
  ON treasury_transfers(status, requested_at);

-- Intentionally DO NOT add fx_rate_id here.
-- treasury_fx_cash_pooling.sql creates treasury_fx_rates first and, because treasury_transfers
-- already exists, requires fx_rate_id to be added after that migration is applied.
