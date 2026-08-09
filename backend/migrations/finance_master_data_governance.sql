CREATE TABLE IF NOT EXISTS finance_master_data_domains (
  id UUID PRIMARY KEY,
  domain_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  record_type VARCHAR(80) NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
  effective_dating BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_master_data_records (
  id UUID PRIMARY KEY,
  domain_id UUID NOT NULL REFERENCES finance_master_data_domains(id) ON DELETE RESTRICT,
  record_key VARCHAR(140) NOT NULL,
  display_name VARCHAR(220) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  effective_from DATE,
  effective_to DATE,
  current_version_id UUID,
  source_type VARCHAR(80),
  source_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(domain_id, record_key)
);

CREATE TABLE IF NOT EXISTS finance_master_data_versions (
  id UUID PRIMARY KEY,
  record_id UUID NOT NULL REFERENCES finance_master_data_records(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  payload JSONB NOT NULL,
  payload_hash VARCHAR(128) NOT NULL,
  change_summary VARCHAR(1000),
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  effective_from DATE,
  effective_to DATE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  superseded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(record_id, version_number)
);

ALTER TABLE finance_master_data_records
  ADD CONSTRAINT finance_master_data_current_version_fk
  FOREIGN KEY (current_version_id)
  REFERENCES finance_master_data_versions(id)
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS finance_change_requests (
  id UUID PRIMARY KEY,
  change_reference VARCHAR(120) NOT NULL UNIQUE,
  record_id UUID REFERENCES finance_master_data_records(id) ON DELETE SET NULL,
  domain_id UUID NOT NULL REFERENCES finance_master_data_domains(id) ON DELETE RESTRICT,
  change_type VARCHAR(30) NOT NULL,
  requested_payload JSONB NOT NULL,
  previous_payload JSONB,
  diff_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  impact_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
  reason VARCHAR(1500) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'submitted',
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_version_id UUID REFERENCES finance_master_data_versions(id) ON DELETE SET NULL,
  implemented_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_change_approvals (
  id UUID PRIMARY KEY,
  change_request_id UUID NOT NULL REFERENCES finance_change_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision VARCHAR(20) NOT NULL,
  notes VARCHAR(1200),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(change_request_id, approver_id)
);

CREATE TABLE IF NOT EXISTS finance_validation_rules (
  id UUID PRIMARY KEY,
  domain_id UUID REFERENCES finance_master_data_domains(id) ON DELETE CASCADE,
  rule_key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'error',
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_data_quality_results (
  id UUID PRIMARY KEY,
  run_reference VARCHAR(120) NOT NULL,
  rule_id UUID NOT NULL REFERENCES finance_validation_rules(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES finance_master_data_domains(id) ON DELETE SET NULL,
  record_id UUID REFERENCES finance_master_data_records(id) ON DELETE CASCADE,
  result VARCHAR(20) NOT NULL,
  issue_code VARCHAR(100),
  issue_message VARCHAR(1500),
  detected_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_period_locks (
  id UUID PRIMARY KEY,
  period_key VARCHAR(30) NOT NULL,
  scope_type VARCHAR(40) NOT NULL,
  scope_value VARCHAR(160),
  currency VARCHAR(3),
  lock_type VARCHAR(30) NOT NULL DEFAULT 'hard',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  reason VARCHAR(1000),
  locked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  unlocked_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_key, scope_type, scope_value, currency)
);
