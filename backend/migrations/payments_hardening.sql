-- Payment attempts + provider event log.
--
-- Payment state used to be written directly onto the order and overwritten on
-- every event. That made double-charges possible, retried webhooks repeat side
-- effects, out-of-order events unpay a settled order, and disputes impossible to
-- investigate. Attempts are append-only; the order's paid state is DERIVED from
-- them.
--
-- Run once:
--   psql -U postgres -d mzaya -f backend/migrations/payments_hardening.sql

BEGIN;

-- ─── Attempts ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_attempts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Makes initiation idempotent: the same key always returns the same attempt,
  -- so a double-tap or a retry can never produce two USSD prompts.
  idempotency_key       varchar(255) NOT NULL UNIQUE,

  -- Snapshotted, so later edits to the order can't rewrite history.
  amount_usd            numeric(10,2) NOT NULL,
  currency              varchar(10)  NOT NULL DEFAULT 'USD',
  method                varchar(50)  NOT NULL,

  -- The number the prompt was actually sent to. Masked in logs and responses.
  payment_phone         varchar(20),

  provider              varchar(50)  NOT NULL DEFAULT 'paynow',
  provider_reference    varchar(255),
  poll_url              text,
  redirect_url          text,

  status                varchar(20)  NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','success','failed','cancelled')),

  provider_payload_hash varchar(128),
  resolved_at           timestamptz,

  "createdAt"           timestamptz NOT NULL DEFAULT now(),
  "updatedAt"           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_attempts_order  ON payment_attempts(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_ref    ON payment_attempts(provider_reference);

-- ─── Provider events ─────────────────────────────────────────────────────────
-- Gateways retry webhooks. Without a record of what we've already seen, a
-- retried "paid" repeats its side effects and a delayed "failed" can drag a
-- settled order backwards. The unique (reference, payload_hash) means the same
-- event can arrive ten times and be applied exactly once.
CREATE TABLE IF NOT EXISTS payment_events (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              uuid REFERENCES orders(id) ON DELETE SET NULL,
  attempt_id            uuid REFERENCES payment_attempts(id) ON DELETE SET NULL,

  provider              varchar(50)  NOT NULL DEFAULT 'paynow',
  provider_reference    varchar(255) NOT NULL,

  raw_status            varchar(100),
  normalized_status     varchar(50),
  payload_hash          varchar(128) NOT NULL,

  applied               boolean NOT NULL DEFAULT false,
  ignored_why           varchar(255),

  "createdAt"           timestamptz NOT NULL DEFAULT now(),
  "updatedAt"           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT payment_events_dedup UNIQUE (provider_reference, payload_hash)
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);

COMMIT;
