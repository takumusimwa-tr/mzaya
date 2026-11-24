-- Batch 07.7B: schema only; runner owns transaction. No historical events fabricated.
-- Mzaya Batch 06.5 — delivery proof and completion audit
CREATE TABLE IF NOT EXISTS delivery_proofs (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  proof_type VARCHAR(24) NOT NULL,
  recipient_name VARCHAR(120),
  recipient_phone VARCHAR(40),
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url TEXT,
  signature_url TEXT,
  notes VARCHAR(500),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS delivery_proofs_order_unique_idx
  ON delivery_proofs(order_id);

CREATE INDEX IF NOT EXISTS delivery_proofs_rider_idx
  ON delivery_proofs(rider_id, captured_at DESC);



CREATE TABLE IF NOT EXISTS order_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status varchar(50),
  to_status varchar(50) NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_role varchar(30),
  note varchar(500),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timelines_order_created
  ON order_timelines(order_id, "createdAt");

