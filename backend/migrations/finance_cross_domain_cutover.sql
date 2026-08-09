-- Batch 08.5.8 — Cross-domain Reconciliation & Finance Cutover
-- Purpose:
--   1. Aggregate reconciliation health across operational finance domains.
--   2. Record cutover readiness and controlled migration decisions.
--   3. Guard/disable legacy direct-ledger paths in phases.
--   4. Preserve immutable audit evidence for finance cutover.

CREATE TABLE IF NOT EXISTS finance_domain_reconciliation_snapshots (
  id UUID PRIMARY KEY,
  snapshot_reference VARCHAR(140) NOT NULL UNIQUE,
  domain_key VARCHAR(80) NOT NULL,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_records INTEGER NOT NULL DEFAULT 0,
  matched_records INTEGER NOT NULL DEFAULT 0,
  exception_records INTEGER NOT NULL DEFAULT 0,
  pending_records INTEGER NOT NULL DEFAULT 0,
  stale_records INTEGER NOT NULL DEFAULT 0,
  match_rate NUMERIC(8,4),
  oldest_exception_age_seconds INTEGER NOT NULL DEFAULT 0,
  health_status VARCHAR(20) NOT NULL DEFAULT 'healthy',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_domain_reconciliation_snapshot_idx
  ON finance_domain_reconciliation_snapshots(domain_key, snapshot_at DESC);

CREATE TABLE IF NOT EXISTS finance_cutover_controls (
  id UUID PRIMARY KEY,
  control_key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description VARCHAR(1200),
  domain_key VARCHAR(80),
  current_mode VARCHAR(30) NOT NULL DEFAULT 'legacy',
  target_mode VARCHAR(30) NOT NULL DEFAULT 'event_engine',
  status VARCHAR(30) NOT NULL DEFAULT 'planned',
  effective_at TIMESTAMPTZ,
  activated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES users(id) ON DELETE SET NULL,
  rolled_back_at TIMESTAMPTZ,
  rollback_reason VARCHAR(1200),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_cutover_readiness_checks (
  id UUID PRIMARY KEY,
  check_reference VARCHAR(140) NOT NULL UNIQUE,
  control_id UUID NOT NULL
    REFERENCES finance_cutover_controls(id) ON DELETE CASCADE,
  check_key VARCHAR(120) NOT NULL,
  name VARCHAR(220) NOT NULL,
  result VARCHAR(20) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'error',
  measured_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  threshold_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  message VARCHAR(1500),
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_cutover_readiness_idx
  ON finance_cutover_readiness_checks(control_id, evaluated_at DESC);

CREATE TABLE IF NOT EXISTS finance_cutover_decisions (
  id UUID PRIMARY KEY,
  decision_reference VARCHAR(140) NOT NULL UNIQUE,
  control_id UUID NOT NULL
    REFERENCES finance_cutover_controls(id) ON DELETE CASCADE,
  decision VARCHAR(30) NOT NULL,
  reason VARCHAR(1500) NOT NULL,
  evidence_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'pending_approval',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_legacy_posting_attempts (
  id UUID PRIMARY KEY,
  attempt_reference VARCHAR(140) NOT NULL UNIQUE,
  source_module VARCHAR(80) NOT NULL,
  source_action VARCHAR(120),
  source_record_id UUID,
  attempted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cutover_control_id UUID
    REFERENCES finance_cutover_controls(id) ON DELETE SET NULL,
  result VARCHAR(30) NOT NULL,
  message VARCHAR(1500),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_legacy_posting_attempt_idx
  ON finance_legacy_posting_attempts(source_module, attempted_at DESC);

CREATE TABLE IF NOT EXISTS finance_cross_domain_reconciliation_runs (
  id UUID PRIMARY KEY,
  run_reference VARCHAR(140) NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(30) NOT NULL DEFAULT 'running',
  domain_count INTEGER NOT NULL DEFAULT 0,
  exception_count INTEGER NOT NULL DEFAULT 0,
  blocking_exception_count INTEGER NOT NULL DEFAULT 0,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_cross_domain_reconciliation_exceptions (
  id UUID PRIMARY KEY,
  run_id UUID NOT NULL
    REFERENCES finance_cross_domain_reconciliation_runs(id) ON DELETE CASCADE,
  domain_key VARCHAR(80) NOT NULL,
  exception_code VARCHAR(120) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'error',
  source_record_id UUID,
  message VARCHAR(1500) NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_cross_domain_exception_idx
  ON finance_cross_domain_reconciliation_exceptions(status, severity, domain_key);
