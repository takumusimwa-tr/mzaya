-- Cleanup after a failed sync.
--
-- The Sequelize model originally declared payment_attempts.status as a Postgres
-- ENUM while the migration created it as varchar + CHECK. On boot, dev sync tried
-- to convert varchar → enum and Postgres refused ("default for column status
-- cannot be cast automatically"), leaving a stray enum type behind.
--
-- The model now uses STRING to match the migration, so the enum type is orphaned.
-- This drops it if it exists. Safe to run even if it doesn't.
--
--   psql -U postgres -d mzaya -f backend/migrations/fix_payment_status_type.sql

BEGIN;

-- Make sure the column really is a varchar with the right default/constraint.
ALTER TABLE payment_attempts
  ALTER COLUMN status TYPE varchar(20) USING status::text;

ALTER TABLE payment_attempts
  ALTER COLUMN status SET DEFAULT 'pending';

-- Re-assert the CHECK (idempotent).
ALTER TABLE payment_attempts DROP CONSTRAINT IF EXISTS payment_attempts_status_check;
ALTER TABLE payment_attempts
  ADD CONSTRAINT payment_attempts_status_check
  CHECK (status IN ('pending','success','failed','cancelled'));

-- Drop the orphaned enum type left behind by the failed sync.
DROP TYPE IF EXISTS enum_payment_attempts_status;

COMMIT;
