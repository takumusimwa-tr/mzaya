-- Mzaya Batch 08.3.2
-- FX rates, exposures, treasury transfers, cash pools, limits,
-- alerts, FX deals and liquidity forecast versioning.

CREATE TABLE IF NOT EXISTS treasury_fx_rates (
  id UUID PRIMARY KEY,
  base_currency VARCHAR(3) NOT NULL,
  quote_currency VARCHAR(3) NOT NULL,
  rate NUMERIC(20,8) NOT NULL CHECK (rate > 0),
  source VARCHAR(60) NOT NULL,
  rate_type VARCHAR(30) NOT NULL DEFAULT 'spot',
  effective_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(base_currency, quote_currency, rate_type, effective_at)
);

CREATE INDEX IF NOT EXISTS treasury_fx_rates_lookup_idx
  ON treasury_fx_rates(base_currency, quote_currency, status, effective_at DESC);

CREATE TABLE IF NOT EXISTS treasury_fx_exposures (
  id UUID PRIMARY KEY,
  exposure_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  exposure_type VARCHAR(40) NOT NULL,
  source_type VARCHAR(60),
  source_id UUID,
  gross_exposure_minor BIGINT NOT NULL DEFAULT 0,
  hedged_minor BIGINT NOT NULL DEFAULT 0,
  net_exposure_minor BIGINT NOT NULL DEFAULT 0,
  reporting_currency VARCHAR(3) NOT NULL,
  reporting_value_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS treasury_fx_exposures_date_idx
  ON treasury_fx_exposures(exposure_date, currency, status);

CREATE TABLE IF NOT EXISTS treasury_fx_deals (
  id UUID PRIMARY KEY,
  deal_reference VARCHAR(120) NOT NULL UNIQUE,
  buy_currency VARCHAR(3) NOT NULL,
  sell_currency VARCHAR(3) NOT NULL,
  buy_amount_minor BIGINT NOT NULL CHECK (buy_amount_minor > 0),
  sell_amount_minor BIGINT NOT NULL CHECK (sell_amount_minor > 0),
  agreed_rate NUMERIC(20,8) NOT NULL CHECK (agreed_rate > 0),
  counterparty VARCHAR(180) NOT NULL,
  trade_date DATE NOT NULL,
  settlement_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'booked',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_transfers (
  id UUID PRIMARY KEY,
  transfer_reference VARCHAR(120) NOT NULL UNIQUE,
  from_bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  to_bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  source_currency VARCHAR(3) NOT NULL,
  destination_currency VARCHAR(3) NOT NULL,
  source_amount_minor BIGINT NOT NULL CHECK (source_amount_minor > 0),
  destination_amount_minor BIGINT NOT NULL CHECK (destination_amount_minor > 0),
  fx_rate_id UUID REFERENCES treasury_fx_rates(id) ON DELETE SET NULL,
  transfer_type VARCHAR(40) NOT NULL DEFAULT 'internal',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failure_reason VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (from_bank_account_id <> to_bank_account_id)
);

CREATE INDEX IF NOT EXISTS treasury_transfers_status_idx
  ON treasury_transfers(status, requested_at);

CREATE TABLE IF NOT EXISTS treasury_cash_pools (
  id UUID PRIMARY KEY,
  pool_code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  header_bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  target_balance_minor BIGINT NOT NULL DEFAULT 0,
  minimum_sweep_minor BIGINT NOT NULL DEFAULT 0,
  sweep_frequency VARCHAR(30) NOT NULL DEFAULT 'daily',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_cash_pool_members (
  id UUID PRIMARY KEY,
  cash_pool_id UUID NOT NULL REFERENCES treasury_cash_pools(id) ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
  target_balance_minor BIGINT NOT NULL DEFAULT 0,
  sweep_direction VARCHAR(20) NOT NULL DEFAULT 'both',
  priority INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cash_pool_id, bank_account_id)
);

CREATE TABLE IF NOT EXISTS treasury_limits (
  id UUID PRIMARY KEY,
  limit_key VARCHAR(100) NOT NULL UNIQUE,
  limit_type VARCHAR(60) NOT NULL,
  currency VARCHAR(3),
  threshold_minor BIGINT,
  threshold_ratio NUMERIC(10,4),
  severity VARCHAR(20) NOT NULL DEFAULT 'warning',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treasury_alerts (
  id UUID PRIMARY KEY,
  limit_id UUID REFERENCES treasury_limits(id) ON DELETE SET NULL,
  alert_type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  title VARCHAR(220) NOT NULL,
  description VARCHAR(1500),
  resource_type VARCHAR(60),
  resource_id UUID,
  detected_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_by UUID REFERENCES users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS treasury_alerts_queue_idx
  ON treasury_alerts(status, severity, detected_at DESC);

CREATE TABLE IF NOT EXISTS liquidity_forecast_versions (
  id UUID PRIMARY KEY,
  forecast_reference VARCHAR(120) NOT NULL UNIQUE,
  version_number INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL,
  forecast_start DATE NOT NULL,
  forecast_end DATE NOT NULL,
  assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  forecast_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (forecast_end >= forecast_start)
);
