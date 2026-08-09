-- Batch 08.5.6 — Treasury & Bank Movement → Finance Event Integration

CREATE TABLE IF NOT EXISTS treasury_transfers (
  id UUID PRIMARY KEY,
  transfer_reference VARCHAR(140) NOT NULL UNIQUE,
  transfer_type VARCHAR(40) NOT NULL,
  source_account_id UUID,
  destination_account_id UUID,
  currency VARCHAR(3) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  provider VARCHAR(60),
  provider_reference VARCHAR(180),
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  finance_reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  finance_last_reconciled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS treasury_transfers_status_idx
  ON treasury_transfers(status, initiated_at);

CREATE TABLE IF NOT EXISTS bank_movements (
  id UUID PRIMARY KEY,
  bank_movement_reference VARCHAR(140) NOT NULL UNIQUE,
  treasury_transfer_id UUID
    REFERENCES treasury_transfers(id) ON DELETE SET NULL,
  bank_account_id UUID NOT NULL,
  direction VARCHAR(10) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  booking_date DATE,
  value_date DATE,
  bank_reference VARCHAR(180),
  counterparty VARCHAR(220),
  description VARCHAR(500),
  source VARCHAR(40) NOT NULL DEFAULT 'manual',
  status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  matched_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bank_movements_match_idx
  ON bank_movements(status, booking_date, bank_account_id);

CREATE TABLE IF NOT EXISTS treasury_finance_reconciliation_results (
  id UUID PRIMARY KEY,
  transfer_id UUID NOT NULL
    REFERENCES treasury_transfers(id) ON DELETE CASCADE,
  result_reference VARCHAR(140) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL,
  exception_code VARCHAR(100),
  exception_message VARCHAR(1500),
  outbox_event_id UUID REFERENCES finance_outbox_events(id) ON DELETE SET NULL,
  finance_business_event_id UUID REFERENCES finance_business_events(id) ON DELETE SET NULL,
  accounting_event_id UUID REFERENCES finance_accounting_events(id) ON DELETE SET NULL,
  ledger_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  bank_movement_id UUID REFERENCES bank_movements(id) ON DELETE SET NULL,
  expected_amount_minor BIGINT,
  observed_amount_minor BIGINT,
  currency VARCHAR(3),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS treasury_finance_reconciliation_idx
  ON treasury_finance_reconciliation_results(status, evaluated_at DESC);
