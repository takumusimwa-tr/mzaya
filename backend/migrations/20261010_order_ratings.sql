-- Order ratings.
--
-- POST /api/orders/:id/rate has always replied "Rating submitted", but the orders
-- table had no columns to hold it, so every rating was silently discarded.
--
-- Idempotent on purpose: safe to run through scripts/migrate.js, or by hand in a
-- psql shell, on a database that may or may not already have these columns.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_rating_range') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_rating_range CHECK (rating IS NULL OR rating BETWEEN 1 AND 5);
  END IF;
END $$;
