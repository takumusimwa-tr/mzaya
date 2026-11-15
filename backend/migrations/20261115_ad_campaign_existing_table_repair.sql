-- Repair an existing Sequelize-created ad_campaigns table; never drop or recreate it.
-- Apply only after reviewing the live schema and taking a database backup.
DO $$
BEGIN
  IF to_regclass('public.ad_campaigns') IS NULL THEN
    RAISE EXCEPTION 'ad_campaigns missing; do not use existing-table repair';
  END IF;
  IF EXISTS (SELECT 1 FROM public.ad_campaigns LIMIT 1) THEN
    RAISE EXCEPTION 'ad_campaigns is not empty; review existing records before applying repair';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.ad_campaigns'::regclass AND conname='ad_campaigns_brand_id_fkey') THEN
    ALTER TABLE public.ad_campaigns ADD CONSTRAINT ad_campaigns_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.ad_campaigns'::regclass AND conname='ad_campaigns_city_id_fkey') THEN
    ALTER TABLE public.ad_campaigns ADD CONSTRAINT ad_campaigns_city_id_fkey FOREIGN KEY (city_id) REFERENCES public.cities(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.ad_campaigns'::regclass AND conname='ad_campaign_date_order') THEN
    ALTER TABLE public.ad_campaigns ADD CONSTRAINT ad_campaign_date_order CHECK (ends_at > starts_at);
  END IF;
END $$;
ALTER TABLE public.ad_campaigns ALTER COLUMN "createdAt" SET DEFAULT NOW();
ALTER TABLE public.ad_campaigns ALTER COLUMN "updatedAt" SET DEFAULT NOW();
CREATE INDEX IF NOT EXISTS ad_campaigns_discovery_idx ON public.ad_campaigns (city_id, category, status, starts_at, ends_at);
