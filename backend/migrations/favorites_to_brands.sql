-- Migrate favourites from branches (vendors) to brands.
--
-- Favourites predate the brand→branch restructure and were missed by it. The
-- customer home now lists BRANDS, so it sends a brand id — but favorites.vendor_id
-- has a foreign key to vendors(id), so every heart tap failed with a FK violation.
--
-- Semantically this was wrong anyway: a customer favourites "Chicken Inn", not
-- "the CBD branch of Chicken Inn". The nearest branch is resolved on tap, exactly
-- as it is everywhere else in the app.
--
-- Safe to run more than once.

BEGIN;

-- 1. Add brand_id (nullable for now so the backfill can run).
ALTER TABLE favorites
  ADD COLUMN IF NOT EXISTS brand_id uuid;

-- 2. Backfill: each existing favourite pointed at a branch — resolve its brand.
UPDATE favorites f
   SET brand_id = v.brand_id
  FROM vendors v
 WHERE v.id = f.vendor_id
   AND f.brand_id IS NULL;

-- 3. Drop any favourite whose branch has no brand (shouldn't exist, but a NULL
--    brand_id would block the NOT NULL below).
DELETE FROM favorites WHERE brand_id IS NULL;

-- 4. Collapse duplicates: two branches of the same brand could both have been
--    favourited, and they now collapse to one brand row.
DELETE FROM favorites a
 USING favorites b
 WHERE a.customer_id = b.customer_id
   AND a.brand_id    = b.brand_id
   AND a.id > b.id;

-- 5. Swap the constraints over to brands.
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_customer_id_vendor_id_key;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_vendor_id_fkey;
ALTER TABLE favorites DROP COLUMN IF EXISTS vendor_id;

ALTER TABLE favorites
  ALTER COLUMN brand_id SET NOT NULL;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_brand_id_fkey
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_customer_id_brand_id_key
  UNIQUE (customer_id, brand_id);

COMMIT;
