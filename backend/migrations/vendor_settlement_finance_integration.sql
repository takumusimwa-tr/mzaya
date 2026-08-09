-- Batch 08.5.3 — Vendor Settlements → Finance Event Integration

CREATE TABLE IF NOT EXISTS vendor_settlements (
  id UUID PRIMARY KEY,
  vendor_id UUID NOT NULL,
  settlement_reference VARCHAR(140) NOT NULL UNIQUE,
  period_from DATE,
  period_to DATE,
  currency VARCHAR(3) NOT NULL,
  gross_sales_minor BIGINT NOT NULL DEFAULT 0,
  refunds_minor BIGINT NOT NULL DEFAULT 0,
  discounts_minor BIGINT NOT NULL DEFAULT 0,
  commission_minor BIGINT NOT NULL DEFAULT 0,
  platform_fee_minor BIGINT NOT NULL DEFAULT 0,
  tax_withheld_minor BIGINT NOT NULL DEFAULT 0,
  adjustments_minor BIGINT NOT NULL DEFAULT 0,
  amount_due_minor BIGINT NOT NULL DEFAULT 0,
  amount_paid_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
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

CREATE INDEX IF NOT EXISTS vendor_settlements_vendor_idx
  ON vendor_settlements(vendor_id, status, due_at);

CREATE TABLE IF NOT EXISTS vendor_settlement_items (
  id UUID PRIMARY KEY,
  settlement_id UUID NOT NULL
    REFERENCES vendor_settlements(id) ON DELETE CASCADE,
  order_id UUID,
  order_type VARCHAR(40),
  gross_minor BIGINT NOT NULL DEFAULT 0,
  refund_minor BIGINT NOT NULL DEFAULT 0,
  commission_minor BIGINT NOT NULL DEFAULT 0,
  tax_withheld_minor BIGINT NOT NULL DEFAULT 0,
  adjustment_minor BIGINT NOT NULL DEFAULT 0,
  net_due_minor BIGINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vendor_settlement_items_settlement_idx
  ON vendor_settlement_items(settlement_id);

CREATE TABLE IF NOT EXISTS vendor_settlement_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  settlement_id UUID NOT NULL
    REFERENCES vendor_settlements(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS vendor_settlement_reconciliation_idx
  ON vendor_settlement_finance_reconciliation_results(status, evaluated_at DESC);
