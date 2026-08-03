-- Mzaya Batch 08.4.2
-- Legal entities, consolidation groups, ownership, intercompany activity,
-- elimination entries, currency translation, and consolidated reports.

CREATE TABLE IF NOT EXISTS legal_entities (
  id UUID PRIMARY KEY,
  entity_code VARCHAR(60) NOT NULL UNIQUE,
  legal_name VARCHAR(180) NOT NULL,
  entity_type VARCHAR(40) NOT NULL,
  country_code VARCHAR(2) NOT NULL,
  functional_currency VARCHAR(3) NOT NULL,
  reporting_currency VARCHAR(3),
  parent_entity_id UUID REFERENCES legal_entities(id) ON DELETE SET NULL,
  ownership_ratio NUMERIC(8,6) NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ownership_ratio >= 0 AND ownership_ratio <= 1)
);

CREATE INDEX IF NOT EXISTS legal_entities_parent_idx
  ON legal_entities(parent_entity_id, status);

CREATE TABLE IF NOT EXISTS consolidation_groups (
  id UUID PRIMARY KEY,
  group_code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  parent_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE RESTRICT,
  reporting_currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consolidation_members (
  id UUID PRIMARY KEY,
  consolidation_group_id UUID NOT NULL
    REFERENCES consolidation_groups(id) ON DELETE CASCADE,
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE RESTRICT,
  ownership_ratio NUMERIC(8,6) NOT NULL DEFAULT 1,
  consolidation_method VARCHAR(30) NOT NULL DEFAULT 'full',
  effective_from DATE NOT NULL,
  effective_to DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(consolidation_group_id, legal_entity_id),
  CHECK (ownership_ratio >= 0 AND ownership_ratio <= 1),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE IF NOT EXISTS entity_account_mappings (
  id UUID PRIMARY KEY,
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE CASCADE,
  local_account_id UUID NOT NULL REFERENCES payment_accounts(id) ON DELETE RESTRICT,
  group_account_code VARCHAR(80) NOT NULL,
  group_account_name VARCHAR(180),
  group_account_type VARCHAR(60) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(legal_entity_id, local_account_id)
);

CREATE TABLE IF NOT EXISTS intercompany_transactions (
  id UUID PRIMARY KEY,
  intercompany_reference VARCHAR(120) NOT NULL UNIQUE,
  source_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE RESTRICT,
  counterparty_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE RESTRICT,
  transaction_type VARCHAR(50) NOT NULL,
  source_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  counterparty_transaction_id UUID REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  currency VARCHAR(3) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  transaction_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  reconciliation_status VARCHAR(30) NOT NULL DEFAULT 'unmatched',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_entity_id <> counterparty_entity_id)
);

CREATE INDEX IF NOT EXISTS intercompany_transactions_match_idx
  ON intercompany_transactions(reconciliation_status, transaction_date);

CREATE TABLE IF NOT EXISTS consolidation_runs (
  id UUID PRIMARY KEY,
  consolidation_group_id UUID NOT NULL
    REFERENCES consolidation_groups(id) ON DELETE CASCADE,
  run_reference VARCHAR(120) NOT NULL UNIQUE,
  period_code VARCHAR(20) NOT NULL,
  reporting_currency VARCHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  started_by UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS elimination_entries (
  id UUID PRIMARY KEY,
  consolidation_run_id UUID NOT NULL
    REFERENCES consolidation_runs(id) ON DELETE CASCADE,
  intercompany_transaction_id UUID
    REFERENCES intercompany_transactions(id) ON DELETE SET NULL,
  elimination_reference VARCHAR(120) NOT NULL UNIQUE,
  account_code VARCHAR(80) NOT NULL,
  debit_minor BIGINT NOT NULL DEFAULT 0,
  credit_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL,
  description VARCHAR(500),
  status VARCHAR(30) NOT NULL DEFAULT 'generated',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_translation_adjustments (
  id UUID PRIMARY KEY,
  consolidation_run_id UUID NOT NULL
    REFERENCES consolidation_runs(id) ON DELETE CASCADE,
  legal_entity_id UUID NOT NULL REFERENCES legal_entities(id) ON DELETE RESTRICT,
  source_currency VARCHAR(3) NOT NULL,
  reporting_currency VARCHAR(3) NOT NULL,
  translated_assets_minor BIGINT NOT NULL DEFAULT 0,
  translated_liabilities_minor BIGINT NOT NULL DEFAULT 0,
  translated_equity_minor BIGINT NOT NULL DEFAULT 0,
  translation_adjustment_minor BIGINT NOT NULL DEFAULT 0,
  fx_rate_id UUID REFERENCES treasury_fx_rates(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_report_snapshots (
  id UUID PRIMARY KEY,
  consolidation_run_id UUID NOT NULL
    REFERENCES consolidation_runs(id) ON DELETE CASCADE,
  report_type VARCHAR(40) NOT NULL,
  reporting_currency VARCHAR(3) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(consolidation_run_id, report_type, version)
);
