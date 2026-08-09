-- Batch 08.5.2 live merge — finance reconciliation belongs on canonical orders.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS finance_reconciliation_status VARCHAR(30)
    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS finance_last_reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finance_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS order_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_type VARCHAR(40) NOT NULL,
  result_reference VARCHAR(140) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL,
  exception_code VARCHAR(100),
  exception_message VARCHAR(1500),
  outbox_event_id UUID REFERENCES finance_outbox_events(id) ON DELETE SET NULL,
  finance_business_event_id UUID REFERENCES finance_business_events(id) ON DELETE SET NULL,
  accounting_event_id UUID REFERENCES finance_accounting_events(id) ON DELETE SET NULL,
  ledger_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  expected_gov_minor BIGINT,
  observed_gov_minor BIGINT,
  expected_delivery_fee_minor BIGINT,
  observed_delivery_fee_minor BIGINT,
  expected_platform_fee_minor BIGINT,
  observed_platform_fee_minor BIGINT,
  currency VARCHAR(3),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS order_finance_reconciliation_lookup_idx
  ON order_finance_reconciliation_results(order_type, order_id, evaluated_at DESC);
