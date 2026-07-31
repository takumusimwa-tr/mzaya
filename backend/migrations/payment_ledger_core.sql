-- Mzaya Batch 08.1.1
-- Immutable financial ledger foundation for customer payments, refunds,
-- vendor settlements, Mzaya earnings, fees and adjustments.

CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY,
  owner_type VARCHAR(30) NOT NULL,
  owner_id UUID,
  account_type VARCHAR(40) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_type, owner_id, account_type, currency)
);

CREATE INDEX IF NOT EXISTS payment_accounts_owner_idx
  ON payment_accounts(owner_type, owner_id, currency);

CREATE TABLE IF NOT EXISTS ledger_transactions (
  id UUID PRIMARY KEY,
  reference VARCHAR(100) NOT NULL UNIQUE,
  transaction_type VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'posted',
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_id UUID,
  currency VARCHAR(3) NOT NULL,
  description VARCHAR(255),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reversed_by_transaction_id UUID REFERENCES ledger_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ledger_transactions_order_idx
  ON ledger_transactions(order_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS ledger_transactions_type_idx
  ON ledger_transactions(transaction_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY,
  transaction_id UUID NOT NULL
    REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  account_id UUID NOT NULL
    REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  direction VARCHAR(10) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  balance_after_minor BIGINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ledger_entries_transaction_idx
  ON ledger_entries(transaction_id);

CREATE INDEX IF NOT EXISTS ledger_entries_account_idx
  ON ledger_entries(account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_idempotency_keys (
  id UUID PRIMARY KEY,
  idempotency_key VARCHAR(180) NOT NULL UNIQUE,
  operation VARCHAR(80) NOT NULL,
  request_hash VARCHAR(128) NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  resource_type VARCHAR(60),
  resource_id UUID,
  locked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_idempotency_expiry_idx
  ON payment_idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS payment_reconciliation_records (
  id UUID PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  provider_reference VARCHAR(180) NOT NULL,
  internal_reference VARCHAR(180),
  record_type VARCHAR(40) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  provider_amount_minor BIGINT NOT NULL,
  internal_amount_minor BIGINT,
  reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  discrepancy_minor BIGINT,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  reconciled_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_reference, record_type)
);

CREATE INDEX IF NOT EXISTS payment_reconciliation_status_idx
  ON payment_reconciliation_records(reconciliation_status, created_at);
