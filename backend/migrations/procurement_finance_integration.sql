-- Batch 08.5.5 — Procurement → Finance Event Integration

CREATE TABLE IF NOT EXISTS procurement_runs (
  id UUID PRIMARY KEY,
  procurement_reference VARCHAR(140) NOT NULL UNIQUE,
  customer_id UUID,
  vendor_id UUID,
  order_id UUID,
  order_type VARCHAR(40),
  currency VARCHAR(3) NOT NULL,
  merchandise_cost_minor BIGINT NOT NULL DEFAULT 0,
  procurement_fee_minor BIGINT NOT NULL DEFAULT 0,
  delivery_fee_minor BIGINT NOT NULL DEFAULT 0,
  tax_minor BIGINT NOT NULL DEFAULT 0,
  discount_minor BIGINT NOT NULL DEFAULT 0,
  reimbursement_minor BIGINT NOT NULL DEFAULT 0,
  amount_authorized_minor BIGINT NOT NULL DEFAULT 0,
  amount_spent_minor BIGINT NOT NULL DEFAULT 0,
  amount_refundable_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  finance_reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  finance_last_reconciled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (amount_authorized_minor >= 0),
  CHECK (amount_spent_minor >= 0),
  CHECK (amount_refundable_minor >= 0)
);

CREATE INDEX IF NOT EXISTS procurement_runs_status_idx
  ON procurement_runs(status, created_at);

CREATE TABLE IF NOT EXISTS procurement_items (
  id UUID PRIMARY KEY,
  procurement_id UUID NOT NULL
    REFERENCES procurement_runs(id) ON DELETE CASCADE,
  item_reference VARCHAR(140),
  description VARCHAR(300),
  quantity NUMERIC(18,4) NOT NULL DEFAULT 1,
  unit_cost_minor BIGINT NOT NULL DEFAULT 0,
  total_cost_minor BIGINT NOT NULL DEFAULT 0,
  vendor_id UUID,
  tax_minor BIGINT NOT NULL DEFAULT 0,
  discount_minor BIGINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS procurement_items_procurement_idx
  ON procurement_items(procurement_id);

CREATE TABLE IF NOT EXISTS procurement_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  procurement_id UUID NOT NULL
    REFERENCES procurement_runs(id) ON DELETE CASCADE,
  result_reference VARCHAR(140) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL,
  exception_code VARCHAR(100),
  exception_message VARCHAR(1500),
  outbox_event_id UUID REFERENCES finance_outbox_events(id) ON DELETE SET NULL,
  finance_business_event_id UUID REFERENCES finance_business_events(id) ON DELETE SET NULL,
  accounting_event_id UUID REFERENCES finance_accounting_events(id) ON DELETE SET NULL,
  ledger_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  expected_amount_minor BIGINT,
  observed_amount_minor BIGINT,
  currency VARCHAR(3),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS procurement_finance_reconciliation_idx
  ON procurement_finance_reconciliation_results(status, evaluated_at DESC);
