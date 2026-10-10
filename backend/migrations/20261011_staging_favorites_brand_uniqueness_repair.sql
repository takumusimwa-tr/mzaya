-- Batch 08.6.6D.4: reconcile the missing brand-favorites uniqueness constraint.
-- Preserves existing rows; no backfill or delete is performed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.favorites'::regclass
      AND conname = 'favorites_customer_id_brand_id_key'
  ) THEN
    ALTER TABLE public.favorites
      ADD CONSTRAINT favorites_customer_id_brand_id_key
      UNIQUE (customer_id, brand_id);
  END IF;
END
$$;
