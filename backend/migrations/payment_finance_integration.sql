-- Batch 08.5.1 live merge — PaymentAttempt is Mzaya's canonical payment entity.

ALTER TABLE payment_attempts
  ADD COLUMN IF NOT EXISTS finance_reconciliation_status VARCHAR(30)
    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS finance_last_reconciled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finance_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS payment_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL
    REFERENCES payment_attempts(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS payment_finance_reconciliation_status_idx
  ON payment_finance_reconciliation_results(status, evaluated_at DESC);
