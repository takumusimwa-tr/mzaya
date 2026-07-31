-- Mzaya Batch 06.3 — dispatch offer persistence
CREATE TABLE IF NOT EXISTS dispatch_offers (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL DEFAULT 'offered',
  score NUMERIC(12, 6) NOT NULL,
  distance_km NUMERIC(10, 3),
  pickup_eta_minutes INTEGER,
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,
  decline_reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dispatch_offers_order_idx
  ON dispatch_offers(order_id, status);

CREATE INDEX IF NOT EXISTS dispatch_offers_rider_idx
  ON dispatch_offers(rider_id, status);

CREATE UNIQUE INDEX IF NOT EXISTS dispatch_one_open_offer_per_order_idx
  ON dispatch_offers(order_id)
  WHERE status = 'offered';
