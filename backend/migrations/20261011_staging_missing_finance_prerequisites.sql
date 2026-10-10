-- Mzaya Batch 08.6.6D.6
-- Missing finance prerequisite contracts for legacy staging.
-- Purpose:
--   1. Introduce the tax jurisdiction/invoice structures required by
--      tax_reporting_operations.sql.
--   2. Introduce the reporting-period structure required by
--      financial_close_reporting.sql.
--
-- Safety:
--   * Additive DDL only.
--   * No data backfill.
--   * No provider calls or external money movement.
--   * No historical ledger/accounting mutation.
--
-- Integration:
--   These structures were referenced by historical migrations but had no
--   owning migration on the current migration graph.

CREATE TABLE IF NOT EXISTS tax_jurisdictions (
  id UUID PRIMARY KEY,
  jurisdiction_code VARCHAR(40) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  country_code VARCHAR(3),
  currency VARCHAR(3),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tax_jurisdictions_status_idx
  ON tax_jurisdictions(status, jurisdiction_code);

CREATE TABLE IF NOT EXISTS tax_invoices (
  id UUID PRIMARY KEY,
  invoice_reference VARCHAR(120) NOT NULL UNIQUE,
  jurisdiction_id UUID
    REFERENCES tax_jurisdictions(id) ON DELETE SET NULL,
  source_type VARCHAR(40) NOT NULL,
  source_id UUID,
  tax_transaction_id UUID
    REFERENCES tax_transactions(id) ON DELETE SET NULL,
  invoice_type VARCHAR(30) NOT NULL DEFAULT 'tax_invoice',
  currency VARCHAR(3) NOT NULL,
  taxable_amount_minor BIGINT NOT NULL DEFAULT 0,
  tax_amount_minor BIGINT NOT NULL DEFAULT 0,
  total_amount_minor BIGINT NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(30) NOT NULL DEFAULT 'issued',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (taxable_amount_minor >= 0),
  CHECK (tax_amount_minor >= 0),
  CHECK (total_amount_minor >= 0)
);

CREATE INDEX IF NOT EXISTS tax_invoices_source_idx
  ON tax_invoices(source_type, source_id);

CREATE INDEX IF NOT EXISTS tax_invoices_jurisdiction_idx
  ON tax_invoices(jurisdiction_id, issued_at DESC);

CREATE TABLE IF NOT EXISTS financial_periods (
  id UUID PRIMARY KEY,
  period_code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  period_type VARCHAR(30) NOT NULL DEFAULT 'month',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  fiscal_year INTEGER NOT NULL,
  fiscal_period INTEGER,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  locked_at TIMESTAMPTZ,
  locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date),
  CHECK (fiscal_period IS NULL OR fiscal_period > 0)
);

CREATE INDEX IF NOT EXISTS financial_periods_lookup_idx
  ON financial_periods(fiscal_year, start_date, end_date);

CREATE INDEX IF NOT EXISTS financial_periods_status_idx
  ON financial_periods(status, end_date);
