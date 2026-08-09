-- Batch 08.5.4 — Mzaya Payouts → Finance Event Integration

CREATE TABLE IF NOT EXISTS mzaya_payouts (
  id UUID PRIMARY KEY,
  mzaya_id UUID NOT NULL,
  payout_reference VARCHAR(140) NOT NULL UNIQUE,
  period_from DATE,
  period_to DATE,
  currency VARCHAR(3) NOT NULL,
  delivery_earnings_minor BIGINT NOT NULL DEFAULT 0,
  tips_minor BIGINT NOT NULL DEFAULT 0,
  incentives_minor BIGINT NOT NULL DEFAULT 0,
  reimbursements_minor BIGINT NOT NULL DEFAULT 0,
  penalties_minor BIGINT NOT NULL DEFAULT 0,
  withholding_minor BIGINT NOT NULL DEFAULT 0,
  adjustments_minor BIGINT NOT NULL DEFAULT 0,
  amount_due_minor BIGINT NOT NULL DEFAULT 0,
  amount_paid_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  payout_method VARCHAR(40),
  provider VARCHAR(60),
  provider_reference VARCHAR(180),
  due_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMPTZ,
  finance_reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  finance_last_reconciled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_to IS NULL OR period_from IS NULL OR period_to >= period_from),
  CHECK (amount_due_minor >= 0),
  CHECK (amount_paid_minor >= 0)
);

CREATE INDEX IF NOT EXISTS mzaya_payouts_mzaya_idx
  ON mzaya_payouts(mzaya_id, status, due_at);

CREATE TABLE IF NOT EXISTS mzaya_payout_items (
  id UUID PRIMARY KEY,
  payout_id UUID NOT NULL
    REFERENCES mzaya_payouts(id) ON DELETE CASCADE,
  order_id UUID,
  order_type VARCHAR(40),
  delivery_earning_minor BIGINT NOT NULL DEFAULT 0,
  tip_minor BIGINT NOT NULL DEFAULT 0,
  incentive_minor BIGINT NOT NULL DEFAULT 0,
  reimbursement_minor BIGINT NOT NULL DEFAULT 0,
  penalty_minor BIGINT NOT NULL DEFAULT 0,
  withholding_minor BIGINT NOT NULL DEFAULT 0,
  adjustment_minor BIGINT NOT NULL DEFAULT 0,
  net_due_minor BIGINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mzaya_payout_items_payout_idx
  ON mzaya_payout_items(payout_id);

CREATE TABLE IF NOT EXISTS mzaya_payout_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  payout_id UUID NOT NULL
    REFERENCES mzaya_payouts(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS mzaya_payout_reconciliation_idx
  ON mzaya_payout_finance_reconciliation_results(status, evaluated_at DESC);
