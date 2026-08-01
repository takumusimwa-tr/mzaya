-- Mzaya Batch 08.4.0
-- Financial close checklists, trial balances, statement snapshots,
-- close adjustments, and reporting periods.

CREATE TABLE IF NOT EXISTS financial_close_cycles (
  id UUID PRIMARY KEY,
  period_id UUID NOT NULL REFERENCES financial_periods(id) ON DELETE RESTRICT,
  close_reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  started_by UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  reopened_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reopened_at TIMESTAMPTZ,
  notes VARCHAR(1500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_id)
);

CREATE TABLE IF NOT EXISTS financial_close_tasks (
  id UUID PRIMARY KEY,
  close_cycle_id UUID NOT NULL
    REFERENCES financial_close_cycles(id) ON DELETE CASCADE,
  task_key VARCHAR(100) NOT NULL,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  sequence INTEGER NOT NULL DEFAULT 100,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes VARCHAR(1500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(close_cycle_id, task_key)
);

CREATE INDEX IF NOT EXISTS financial_close_tasks_queue_idx
  ON financial_close_tasks(close_cycle_id, status, sequence);

CREATE TABLE IF NOT EXISTS trial_balance_snapshots (
  id UUID PRIMARY KEY,
  close_cycle_id UUID NOT NULL
    REFERENCES financial_close_cycles(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL,
  snapshot_type VARCHAR(30) NOT NULL DEFAULT 'pre_close',
  total_debits_minor BIGINT NOT NULL DEFAULT 0,
  total_credits_minor BIGINT NOT NULL DEFAULT 0,
  balanced BOOLEAN NOT NULL DEFAULT FALSE,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trial_balance_lines (
  id UUID PRIMARY KEY,
  snapshot_id UUID NOT NULL
    REFERENCES trial_balance_snapshots(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  account_code VARCHAR(80),
  account_name VARCHAR(180),
  account_type VARCHAR(60),
  debit_minor BIGINT NOT NULL DEFAULT 0,
  credit_minor BIGINT NOT NULL DEFAULT 0,
  net_minor BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(snapshot_id, account_id)
);

CREATE INDEX IF NOT EXISTS trial_balance_lines_snapshot_idx
  ON trial_balance_lines(snapshot_id, account_type);

CREATE TABLE IF NOT EXISTS financial_statement_snapshots (
  id UUID PRIMARY KEY,
  close_cycle_id UUID NOT NULL
    REFERENCES financial_close_cycles(id) ON DELETE CASCADE,
  statement_type VARCHAR(40) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  statement_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(close_cycle_id, statement_type, currency, version)
);

CREATE TABLE IF NOT EXISTS close_adjustments (
  id UUID PRIMARY KEY,
  close_cycle_id UUID NOT NULL
    REFERENCES financial_close_cycles(id) ON DELETE CASCADE,
  adjustment_reference VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  posted_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS close_adjustment_lines (
  id UUID PRIMARY KEY,
  adjustment_id UUID NOT NULL
    REFERENCES close_adjustments(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  direction VARCHAR(10) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  memo VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
