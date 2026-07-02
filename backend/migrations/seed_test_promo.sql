-- backend/migrations/seed_test_promo.sql
-- Run: & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d mzaya -f "C:\Users\takum\Downloads\Projects\mzaya\backend\migrations\seed_test_promo.sql"
-- Creates a few test promo codes. Safe to re-run — ON CONFLICT skips duplicates.

INSERT INTO promos (id, code, type, value, min_order_usd, max_discount_usd, usage_limit, used_count, expires_at, is_active, "createdAt", "updatedAt")
VALUES
  -- 20% off subtotal, no minimum
  (gen_random_uuid(), 'MZAYA20', 'percent', 20, 0, NULL, NULL, 0, NULL, true, now(), now()),
  -- $2 flat off, needs $10+ order
  (gen_random_uuid(), 'SAVE2', 'fixed', 2, 10, NULL, NULL, 0, NULL, true, now(), now()),
  -- Free delivery, no minimum
  (gen_random_uuid(), 'FREEDEL', 'free_delivery', 0, 0, NULL, NULL, 0, NULL, true, now(), now())
ON CONFLICT (code) DO NOTHING;

-- Show what's in the table now
SELECT code, type, value, min_order_usd, is_active FROM promos ORDER BY code;
