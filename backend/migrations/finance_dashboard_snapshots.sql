-- Mzaya Batch 08.1.4
-- Historical finance snapshots used for trend analysis without repeatedly
-- scanning the full immutable ledger during dashboard requests.

CREATE TABLE IF NOT EXISTS finance_daily_snapshots (
  snapshot_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL,
  gmv_minor BIGINT NOT NULL DEFAULT 0,
  platform_revenue_minor BIGINT NOT NULL DEFAULT 0,
  vendor_payable_minor BIGINT NOT NULL DEFAULT 0,
  mzaya_payable_minor BIGINT NOT NULL DEFAULT 0,
  refunds_minor BIGINT NOT NULL DEFAULT 0,
  chargebacks_minor BIGINT NOT NULL DEFAULT 0,
  settlements_paid_minor BIGINT NOT NULL DEFAULT 0,
  settlements_pending_minor BIGINT NOT NULL DEFAULT 0,
  reconciliation_matched_count INTEGER NOT NULL DEFAULT 0,
  reconciliation_exception_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(snapshot_date, currency)
);

CREATE INDEX IF NOT EXISTS finance_daily_snapshots_currency_idx
  ON finance_daily_snapshots(currency, snapshot_date DESC);

CREATE TABLE IF NOT EXISTS finance_export_jobs (
  id UUID PRIMARY KEY,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  export_type VARCHAR(30) NOT NULL,
  format VARCHAR(20) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  storage_key TEXT,
  error_message VARCHAR(1000),
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_export_jobs_status_idx
  ON finance_export_jobs(status, created_at);
