-- Mzaya Batch 08.3.1
-- Bank statement imports, duplicate protection, automated reconciliation,
-- match candidates, and reconciliation review history.

CREATE TABLE IF NOT EXISTS bank_statement_import_rows (
  id UUID PRIMARY KEY,
  statement_import_id UUID NOT NULL
    REFERENCES bank_statement_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  raw_data JSONB NOT NULL,
  normalized_data JSONB,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  error_message VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(statement_import_id, row_number)
);

CREATE INDEX IF NOT EXISTS bank_statement_import_rows_status_idx
  ON bank_statement_import_rows(statement_import_id, status);

CREATE TABLE IF NOT EXISTS treasury_reconciliation_candidates (
  id UUID PRIMARY KEY,
  bank_transaction_id UUID NOT NULL
    REFERENCES bank_transactions(id) ON DELETE CASCADE,
  ledger_transaction_id UUID NOT NULL
    REFERENCES ledger_transactions(id) ON DELETE CASCADE,
  score NUMERIC(6,4) NOT NULL,
  amount_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  date_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  reference_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  description_score NUMERIC(6,4) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'candidate',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(bank_transaction_id, ledger_transaction_id)
);

CREATE INDEX IF NOT EXISTS treasury_reconciliation_candidates_score_idx
  ON treasury_reconciliation_candidates(bank_transaction_id, score DESC);

CREATE TABLE IF NOT EXISTS treasury_reconciliation_reviews (
  id UUID PRIMARY KEY,
  bank_transaction_id UUID NOT NULL
    REFERENCES bank_transactions(id) ON DELETE CASCADE,
  reconciliation_id UUID
    REFERENCES treasury_reconciliations(id) ON DELETE SET NULL,
  reviewed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  action VARCHAR(40) NOT NULL,
  notes VARCHAR(1000),
  previous_status VARCHAR(30),
  new_status VARCHAR(30),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS treasury_reconciliation_reviews_bank_idx
  ON treasury_reconciliation_reviews(bank_transaction_id, reviewed_at);
