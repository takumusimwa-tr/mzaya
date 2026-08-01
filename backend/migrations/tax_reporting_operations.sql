-- Mzaya Batch 08.2.2
-- Tax registrations, filing periods, returns, withholding certificates,
-- invoice documents and statutory reporting workflow.

CREATE TABLE IF NOT EXISTS tax_registrations (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID NOT NULL
    REFERENCES tax_jurisdictions(id) ON DELETE CASCADE,
  registration_type VARCHAR(40) NOT NULL,
  registration_number VARCHAR(120) NOT NULL,
  legal_name VARCHAR(180) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jurisdiction_id, registration_type, registration_number),
  CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX IF NOT EXISTS tax_registrations_status_idx
  ON tax_registrations(jurisdiction_id, status, effective_from DESC);

CREATE TABLE IF NOT EXISTS tax_filing_periods (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID NOT NULL
    REFERENCES tax_jurisdictions(id) ON DELETE CASCADE,
  tax_type VARCHAR(40) NOT NULL,
  period_code VARCHAR(30) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  locked_at TIMESTAMPTZ,
  filed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(jurisdiction_id, tax_type, period_code),
  CHECK (end_date >= start_date),
  CHECK (due_date >= end_date)
);

CREATE INDEX IF NOT EXISTS tax_filing_periods_due_idx
  ON tax_filing_periods(status, due_date);

CREATE TABLE IF NOT EXISTS tax_returns (
  id UUID PRIMARY KEY,
  filing_period_id UUID NOT NULL
    REFERENCES tax_filing_periods(id) ON DELETE RESTRICT,
  registration_id UUID NOT NULL
    REFERENCES tax_registrations(id) ON DELETE RESTRICT,
  return_reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  taxable_sales_minor BIGINT NOT NULL DEFAULT 0,
  output_tax_minor BIGINT NOT NULL DEFAULT 0,
  input_tax_minor BIGINT NOT NULL DEFAULT 0,
  adjustments_minor BIGINT NOT NULL DEFAULT 0,
  net_tax_due_minor BIGINT NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL,
  prepared_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  prepared_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  submission_reference VARCHAR(180),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(filing_period_id, registration_id)
);

CREATE INDEX IF NOT EXISTS tax_returns_status_idx
  ON tax_returns(status, created_at DESC);

CREATE TABLE IF NOT EXISTS withholding_tax_records (
  id UUID PRIMARY KEY,
  jurisdiction_id UUID NOT NULL
    REFERENCES tax_jurisdictions(id) ON DELETE RESTRICT,
  payee_type VARCHAR(30) NOT NULL,
  payee_id UUID NOT NULL,
  source_type VARCHAR(40) NOT NULL,
  source_id UUID,
  gross_minor BIGINT NOT NULL CHECK (gross_minor >= 0),
  rate_basis_points INTEGER NOT NULL CHECK (rate_basis_points >= 0),
  withheld_minor BIGINT NOT NULL CHECK (withheld_minor >= 0),
  currency VARCHAR(3) NOT NULL,
  certificate_number VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'calculated',
  withheld_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  remitted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS withholding_tax_records_payee_idx
  ON withholding_tax_records(payee_type, payee_id, withheld_at DESC);

CREATE TABLE IF NOT EXISTS tax_return_audit (
  id UUID PRIMARY KEY,
  tax_return_id UUID NOT NULL
    REFERENCES tax_returns(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tax_return_audit_return_idx
  ON tax_return_audit(tax_return_id, created_at ASC);

ALTER TABLE tax_invoices
  ADD COLUMN IF NOT EXISTS document_storage_key TEXT,
  ADD COLUMN IF NOT EXISTS document_generated_at TIMESTAMPTZ;
