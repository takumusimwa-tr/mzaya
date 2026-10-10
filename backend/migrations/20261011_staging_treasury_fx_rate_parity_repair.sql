-- Mzaya Batch 08.6.6D.5B
-- Treasury transfer FX-rate contract parity repair.
--
-- The legacy staging treasury_transfers table was reconciled before
-- treasury_fx_rates existed. treasury_fx_cash_pooling.sql subsequently used
-- CREATE TABLE IF NOT EXISTS, so it could not add the intended fx_rate_id
-- column to the already-existing treasury_transfers table.
--
-- Safety:
--   * Additive DDL only.
--   * No transfer rows are updated or created.
--   * No provider/bank action or external money movement.
--   * Historical accounting records are untouched.

DO $$
BEGIN
  IF to_regclass('public.treasury_transfers') IS NULL THEN
    RAISE EXCEPTION 'treasury_transfers is required before FX-rate parity repair';
  END IF;

  IF to_regclass('public.treasury_fx_rates') IS NULL THEN
    RAISE EXCEPTION 'treasury_fx_rates is required before FX-rate parity repair';
  END IF;
END
$$;

ALTER TABLE treasury_transfers
  ADD COLUMN IF NOT EXISTS fx_rate_id UUID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'treasury_transfers_fx_rate_id_fkey'
      AND conrelid = 'treasury_transfers'::regclass
  ) THEN
    ALTER TABLE treasury_transfers
      ADD CONSTRAINT treasury_transfers_fx_rate_id_fkey
      FOREIGN KEY (fx_rate_id)
      REFERENCES treasury_fx_rates(id)
      ON DELETE SET NULL;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS treasury_transfers_fx_rate_idx
  ON treasury_transfers(fx_rate_id)
  WHERE fx_rate_id IS NOT NULL;
