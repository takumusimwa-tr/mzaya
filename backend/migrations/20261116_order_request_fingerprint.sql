-- Run only AFTER 20261116_order_request_id.sql.
-- Existing idempotency rows will have NULL fingerprints and intentionally
-- cannot be replayed safely until migrated with trustworthy original payloads.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS request_fingerprint VARCHAR(64);
ALTER TABLE orders ADD CONSTRAINT orders_request_fingerprint_shape
  CHECK (request_fingerprint IS NULL OR request_fingerprint ~ '^[0-9a-f]{64}$');
