-- Advertising is distinct from discount codes in promos.
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES brands(id),
  city_id UUID NOT NULL REFERENCES cities(id),
  category VARCHAR(20) NOT NULL CHECK (category IN ('food','grocery','materials')),
  title VARCHAR(100) NOT NULL,
  description VARCHAR(240),
  image_url VARCHAR(1024),
  cta VARCHAR(40) NOT NULL DEFAULT 'Explore vendor',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','approved','rejected','paused')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ad_campaign_date_order CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS ad_campaigns_discovery_idx
  ON ad_campaigns (city_id, category, status, starts_at, ends_at);
