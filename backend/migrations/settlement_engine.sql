-- Mzaya Batch 08.1.3
-- Vendor and Mzaya settlement engine.

CREATE TABLE IF NOT EXISTS settlement_profiles (
  id UUID PRIMARY KEY,
  owner_type VARCHAR(20) NOT NULL,
  owner_id UUID NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payout_method VARCHAR(30) NOT NULL,
  payout_destination JSONB NOT NULL DEFAULT '{}'::jsonb,
  minimum_payout_minor BIGINT NOT NULL DEFAULT 0,
  schedule VARCHAR(30) NOT NULL DEFAULT 'weekly',
  hold_days INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_settled_at TIMESTAMPTZ,
  next_settlement_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_type, owner_id, currency)
);

CREATE INDEX IF NOT EXISTS settlement_profiles_due_idx
  ON settlement_profiles(status, next_settlement_at);

CREATE TABLE IF NOT EXISTS settlement_batches (
  id UUID PRIMARY KEY,
  batch_reference VARCHAR(100) NOT NULL UNIQUE,
  owner_type VARCHAR(20) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  settlement_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  total_gross_minor BIGINT NOT NULL DEFAULT 0,
  total_adjustments_minor BIGINT NOT NULL DEFAULT 0,
  total_fees_minor BIGINT NOT NULL DEFAULT 0,
  total_net_minor BIGINT NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settlement_batches_status_idx
  ON settlement_batches(status, settlement_date DESC);

CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL
    REFERENCES settlement_batches(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL
    REFERENCES settlement_profiles(id) ON DELETE RESTRICT,
  owner_type VARCHAR(20) NOT NULL,
  owner_id UUID NOT NULL,
  currency VARCHAR(3) NOT NULL,
  gross_minor BIGINT NOT NULL DEFAULT 0,
  adjustments_minor BIGINT NOT NULL DEFAULT 0,
  fees_minor BIGINT NOT NULL DEFAULT 0,
  net_minor BIGINT NOT NULL DEFAULT 0,
  payable_account_id UUID NOT NULL
    REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  payout_account_id UUID NOT NULL
    REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  payout_reference VARCHAR(180),
  provider VARCHAR(40),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  failure_reason VARCHAR(500),
  submitted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(batch_id, profile_id)
);

CREATE INDEX IF NOT EXISTS settlements_owner_idx
  ON settlements(owner_type, owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS settlements_status_idx
  ON settlements(status, created_at);

CREATE TABLE IF NOT EXISTS settlement_items (
  id UUID PRIMARY KEY,
  settlement_id UUID NOT NULL
    REFERENCES settlements(id) ON DELETE CASCADE,
  source_transaction_id UUID NOT NULL
    REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  source_entry_id UUID NOT NULL
    REFERENCES ledger_entries(id) ON DELETE RESTRICT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  item_type VARCHAR(40) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_entry_id)
);

CREATE INDEX IF NOT EXISTS settlement_items_settlement_idx
  ON settlement_items(settlement_id);

CREATE TABLE IF NOT EXISTS settlement_adjustments (
  id UUID PRIMARY KEY,
  owner_type VARCHAR(20) NOT NULL,
  owner_id UUID NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount_minor BIGINT NOT NULL,
  adjustment_type VARCHAR(40) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  applied_settlement_id UUID REFERENCES settlements(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settlement_adjustments_owner_idx
  ON settlement_adjustments(owner_type, owner_id, status, created_at);

CREATE TABLE IF NOT EXISTS settlement_audit (
  id UUID PRIMARY KEY,
  settlement_id UUID REFERENCES settlements(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES settlement_batches(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS settlement_audit_settlement_idx
  ON settlement_audit(settlement_id, created_at);
