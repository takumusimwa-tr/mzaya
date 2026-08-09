-- Batch 08.5.7 — Tax Event Integration
-- Tax configuration remains governed by finance master data.
-- This migration stores tax facts, liabilities, remittances, and reconciliation.

CREATE TABLE IF NOT EXISTS tax_transactions (
  id UUID PRIMARY KEY,
  tax_reference VARCHAR(140) NOT NULL UNIQUE,
  source_type VARCHAR(60) NOT NULL,
  source_id UUID,
  source_event_type VARCHAR(120),
  jurisdiction_code VARCHAR(40),
  tax_code VARCHAR(80) NOT NULL,
  tax_type VARCHAR(60) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  taxable_base_minor BIGINT NOT NULL DEFAULT 0,
  tax_rate_bps INTEGER,
  tax_amount_minor BIGINT NOT NULL DEFAULT 0,
  tax_inclusive BOOLEAN NOT NULL DEFAULT FALSE,
  direction VARCHAR(20) NOT NULL DEFAULT 'payable',
  status VARCHAR(30) NOT NULL DEFAULT 'calculated',
  recognized_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  finance_reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  finance_last_reconciled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (taxable_base_minor >= 0),
  CHECK (tax_amount_minor >= 0)
);

CREATE INDEX IF NOT EXISTS tax_transactions_source_idx
  ON tax_transactions(source_type, source_id, tax_type);

CREATE INDEX IF NOT EXISTS tax_transactions_status_idx
  ON tax_transactions(status, recognized_at);

CREATE TABLE IF NOT EXISTS tax_liabilities (
  id UUID PRIMARY KEY,
  liability_reference VARCHAR(140) NOT NULL UNIQUE,
  jurisdiction_code VARCHAR(40),
  tax_code VARCHAR(80) NOT NULL,
  tax_type VARCHAR(60) NOT NULL,
  period_key VARCHAR(30) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  opening_balance_minor BIGINT NOT NULL DEFAULT 0,
  tax_accrued_minor BIGINT NOT NULL DEFAULT 0,
  adjustments_minor BIGINT NOT NULL DEFAULT 0,
  tax_paid_minor BIGINT NOT NULL DEFAULT 0,
  closing_balance_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  due_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jurisdiction_code, tax_code, tax_type, period_key, currency)
);

CREATE INDEX IF NOT EXISTS tax_liabilities_due_idx
  ON tax_liabilities(status, due_at);

CREATE TABLE IF NOT EXISTS tax_remittances (
  id UUID PRIMARY KEY,
  remittance_reference VARCHAR(140) NOT NULL UNIQUE,
  liability_id UUID NOT NULL
    REFERENCES tax_liabilities(id) ON DELETE RESTRICT,
  treasury_transfer_id UUID
    REFERENCES treasury_transfers(id) ON DELETE SET NULL,
  currency VARCHAR(3) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  provider_reference VARCHAR(180),
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  tax_transaction_id UUID NOT NULL
    REFERENCES tax_transactions(id) ON DELETE CASCADE,
  result_reference VARCHAR(140) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL,
  exception_code VARCHAR(100),
  exception_message VARCHAR(1500),
  outbox_event_id UUID REFERENCES finance_outbox_events(id) ON DELETE SET NULL,
  finance_business_event_id UUID REFERENCES finance_business_events(id) ON DELETE SET NULL,
  accounting_event_id UUID REFERENCES finance_accounting_events(id) ON DELETE SET NULL,
  ledger_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  expected_tax_minor BIGINT,
  observed_tax_minor BIGINT,
  currency VARCHAR(3),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tax_finance_reconciliation_idx
  ON tax_finance_reconciliation_results(status, evaluated_at DESC);
