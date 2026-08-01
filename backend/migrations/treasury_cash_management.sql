-- Mzaya Batch 08.3.0
-- Treasury, banking, cash positioning, statement imports,
-- bank reconciliation, payment batches and liquidity snapshots.

CREATE TABLE IF NOT EXISTS treasury_accounts (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  account_type VARCHAR(40) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  ledger_account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
  minimum_balance_minor BIGINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY,
  treasury_account_id UUID NOT NULL
    REFERENCES treasury_accounts(id) ON DELETE CASCADE,
  bank_name VARCHAR(160) NOT NULL,
  account_name VARCHAR(180) NOT NULL,
  account_last4 VARCHAR(4) NOT NULL,
  account_token VARCHAR(255),
  branch_code VARCHAR(60),
  swift_code VARCHAR(20),
  country_code VARCHAR(2),
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  current_balance_minor BIGINT NOT NULL DEFAULT 0,
  available_balance_minor BIGINT NOT NULL DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bank_accounts_treasury_idx
  ON bank_accounts(treasury_account_id, status);

CREATE TABLE IF NOT EXISTS bank_statement_imports (
  id UUID PRIMARY KEY,
  bank_account_id UUID NOT NULL
    REFERENCES bank_accounts(id) ON DELETE CASCADE,
  import_reference VARCHAR(120) NOT NULL UNIQUE,
  statement_from DATE,
  statement_to DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  source_format VARCHAR(20) NOT NULL,
  source_storage_key TEXT,
  record_count INTEGER NOT NULL DEFAULT 0,
  imported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  imported_at TIMESTAMPTZ,
  error_message VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY,
  bank_account_id UUID NOT NULL
    REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_import_id UUID
    REFERENCES bank_statement_imports(id) ON DELETE SET NULL,
  provider_reference VARCHAR(180),
  transaction_date DATE NOT NULL,
  value_date DATE,
  direction VARCHAR(10) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL,
  description VARCHAR(500),
  counterparty_name VARCHAR(180),
  counterparty_reference VARCHAR(180),
  running_balance_minor BIGINT,
  reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bank_account_id, provider_reference)
);

CREATE INDEX IF NOT EXISTS bank_transactions_reconciliation_idx
  ON bank_transactions(reconciliation_status, transaction_date);

CREATE TABLE IF NOT EXISTS treasury_reconciliations (
  id UUID PRIMARY KEY,
  bank_transaction_id UUID NOT NULL
    REFERENCES bank_transactions(id) ON DELETE CASCADE,
  ledger_transaction_id UUID
    REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  matched_by UUID REFERENCES users(id) ON DELETE SET NULL,
  match_type VARCHAR(30) NOT NULL,
  amount_difference_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'matched',
  notes VARCHAR(1000),
  matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bank_transaction_id)
);

CREATE TABLE IF NOT EXISTS cash_movements (
  id UUID PRIMARY KEY,
  treasury_account_id UUID NOT NULL
    REFERENCES treasury_accounts(id) ON DELETE RESTRICT,
  bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
  movement_type VARCHAR(40) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL,
  reference VARCHAR(120) NOT NULL UNIQUE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_type VARCHAR(60),
  source_id UUID,
  description VARCHAR(500),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_payment_batches (
  id UUID PRIMARY KEY,
  batch_reference VARCHAR(120) NOT NULL UNIQUE,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  payment_count INTEGER NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  provider_reference VARCHAR(180),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_payment_batch_items (
  id UUID PRIMARY KEY,
  batch_id UUID NOT NULL
    REFERENCES treasury_payment_batches(id) ON DELETE CASCADE,
  beneficiary_type VARCHAR(40) NOT NULL,
  beneficiary_id UUID,
  beneficiary_name VARCHAR(180) NOT NULL,
  destination_token VARCHAR(255),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL,
  purpose VARCHAR(180),
  source_type VARCHAR(60),
  source_id UUID,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  provider_reference VARCHAR(180),
  failure_reason VARCHAR(500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS liquidity_snapshots (
  snapshot_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  total_cash_minor BIGINT NOT NULL DEFAULT 0,
  available_cash_minor BIGINT NOT NULL DEFAULT 0,
  restricted_cash_minor BIGINT NOT NULL DEFAULT 0,
  pending_outflows_minor BIGINT NOT NULL DEFAULT 0,
  forecast_inflows_minor BIGINT NOT NULL DEFAULT 0,
  forecast_outflows_minor BIGINT NOT NULL DEFAULT 0,
  runway_days NUMERIC(10,2),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(snapshot_date, currency)
);
