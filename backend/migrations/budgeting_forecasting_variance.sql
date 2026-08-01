-- Mzaya Batch 08.4.1
-- Budgets, versions, allocations, rolling forecasts, and variance reporting.

CREATE TABLE IF NOT EXISTS finance_budgets (
  id UUID PRIMARY KEY,
  budget_code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  budget_type VARCHAR(30) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_budget_versions (
  id UUID PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES finance_budgets(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(budget_id, version_number)
);

CREATE TABLE IF NOT EXISTS finance_budget_lines (
  id UUID PRIMARY KEY,
  budget_version_id UUID NOT NULL
    REFERENCES finance_budget_versions(id) ON DELETE CASCADE,
  period_code VARCHAR(20) NOT NULL,
  account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
  department_code VARCHAR(60),
  cost_center_code VARCHAR(60),
  line_type VARCHAR(40) NOT NULL,
  amount_minor BIGINT NOT NULL,
  notes VARCHAR(500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_budget_lines_lookup_idx
  ON finance_budget_lines(budget_version_id, period_code, department_code, cost_center_code);

CREATE TABLE IF NOT EXISTS finance_budget_allocations (
  id UUID PRIMARY KEY,
  source_budget_line_id UUID NOT NULL
    REFERENCES finance_budget_lines(id) ON DELETE CASCADE,
  target_type VARCHAR(40) NOT NULL,
  target_code VARCHAR(80) NOT NULL,
  allocation_ratio NUMERIC(10,6) NOT NULL CHECK (allocation_ratio >= 0),
  allocated_minor BIGINT NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_forecasts (
  id UUID PRIMARY KEY,
  forecast_code VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  forecast_type VARCHAR(30) NOT NULL DEFAULT 'rolling',
  horizon_months INTEGER NOT NULL DEFAULT 12,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_forecast_versions (
  id UUID PRIMARY KEY,
  forecast_id UUID NOT NULL REFERENCES finance_forecasts(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  scenario VARCHAR(30) NOT NULL DEFAULT 'base',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(forecast_id, version_number, scenario)
);

CREATE TABLE IF NOT EXISTS finance_forecast_lines (
  id UUID PRIMARY KEY,
  forecast_version_id UUID NOT NULL
    REFERENCES finance_forecast_versions(id) ON DELETE CASCADE,
  period_code VARCHAR(20) NOT NULL,
  account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
  department_code VARCHAR(60),
  cost_center_code VARCHAR(60),
  line_type VARCHAR(40) NOT NULL,
  amount_minor BIGINT NOT NULL,
  confidence_ratio NUMERIC(8,4) NOT NULL DEFAULT 1,
  source_type VARCHAR(60),
  source_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_variance_reports (
  id UUID PRIMARY KEY,
  report_reference VARCHAR(100) NOT NULL UNIQUE,
  report_type VARCHAR(40) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  period_from VARCHAR(20) NOT NULL,
  period_to VARCHAR(20) NOT NULL,
  budget_version_id UUID REFERENCES finance_budget_versions(id) ON DELETE SET NULL,
  forecast_version_id UUID REFERENCES finance_forecast_versions(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'generated',
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_variance_report_lines (
  id UUID PRIMARY KEY,
  variance_report_id UUID NOT NULL
    REFERENCES finance_variance_reports(id) ON DELETE CASCADE,
  period_code VARCHAR(20) NOT NULL,
  account_id UUID REFERENCES payment_accounts(id) ON DELETE SET NULL,
  department_code VARCHAR(60),
  cost_center_code VARCHAR(60),
  actual_minor BIGINT NOT NULL DEFAULT 0,
  comparator_minor BIGINT NOT NULL DEFAULT 0,
  variance_minor BIGINT NOT NULL DEFAULT 0,
  variance_ratio NUMERIC(12,6),
  favorable BOOLEAN,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_variance_lines_report_idx
  ON finance_variance_report_lines(variance_report_id, period_code);
