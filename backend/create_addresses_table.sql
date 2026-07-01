-- Saved delivery addresses per customer
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label       VARCHAR(100) NOT NULL,        -- "Home", "Work", "Mom's place"
  address     VARCHAR(255) NOT NULL,        -- full street address
  location    JSONB,                        -- {lat, lng} optional
  notes       VARCHAR(255),                 -- "gate code 1234, blue door"
  is_default  BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON addresses(customer_id);
