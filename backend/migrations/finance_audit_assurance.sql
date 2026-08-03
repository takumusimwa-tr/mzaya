-- Mzaya Batch 08.4.5
-- Finance audit planning, control testing, evidence, findings,
-- remediation, continuous monitoring, and assurance reporting.

CREATE TABLE IF NOT EXISTS finance_audit_plans (
  id UUID PRIMARY KEY,
  plan_reference VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  fiscal_year INTEGER NOT NULL,
  planning_method VARCHAR(40) NOT NULL DEFAULT 'risk_based',
  status VARCHAR(30) NOT NULL DEFAULT 'draft',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  risk_universe JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_audit_engagements (
  id UUID PRIMARY KEY,
  audit_plan_id UUID REFERENCES finance_audit_plans(id) ON DELETE SET NULL,
  engagement_reference VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  scope_type VARCHAR(40) NOT NULL,
  scope_value VARCHAR(180),
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  risk_rating VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'planned',
  lead_auditor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  overall_conclusion VARCHAR(2000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_to >= period_from)
);

CREATE INDEX IF NOT EXISTS finance_audit_engagements_status_idx
  ON finance_audit_engagements(status, risk_rating);

CREATE TABLE IF NOT EXISTS finance_audit_procedures (
  id UUID PRIMARY KEY,
  engagement_id UUID NOT NULL
    REFERENCES finance_audit_engagements(id) ON DELETE CASCADE,
  procedure_key VARCHAR(100) NOT NULL,
  name VARCHAR(180) NOT NULL,
  control_area VARCHAR(60) NOT NULL,
  procedure_type VARCHAR(30) NOT NULL,
  description VARCHAR(1500),
  expected_result VARCHAR(1000),
  sequence INTEGER NOT NULL DEFAULT 100,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(engagement_id, procedure_key)
);

CREATE TABLE IF NOT EXISTS finance_control_assessments (
  id UUID PRIMARY KEY,
  procedure_id UUID REFERENCES finance_audit_procedures(id) ON DELETE SET NULL,
  control_key VARCHAR(120) NOT NULL,
  control_name VARCHAR(180) NOT NULL,
  control_area VARCHAR(60) NOT NULL,
  design_rating VARCHAR(30),
  operating_rating VARCHAR(30),
  test_period_from DATE,
  test_period_to DATE,
  population_size INTEGER,
  sample_size INTEGER,
  exceptions_count INTEGER NOT NULL DEFAULT 0,
  effectiveness_score NUMERIC(8,4),
  conclusion VARCHAR(1500),
  assessed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_audit_samples (
  id UUID PRIMARY KEY,
  assessment_id UUID NOT NULL
    REFERENCES finance_control_assessments(id) ON DELETE CASCADE,
  sample_reference VARCHAR(120) NOT NULL UNIQUE,
  population_reference VARCHAR(180),
  source_type VARCHAR(60) NOT NULL,
  source_id UUID,
  selection_method VARCHAR(40) NOT NULL,
  result VARCHAR(30) NOT NULL DEFAULT 'pending',
  exception_code VARCHAR(80),
  notes VARCHAR(1000),
  tested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  tested_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_audit_evidence (
  id UUID PRIMARY KEY,
  engagement_id UUID
    REFERENCES finance_audit_engagements(id) ON DELETE CASCADE,
  procedure_id UUID
    REFERENCES finance_audit_procedures(id) ON DELETE CASCADE,
  assessment_id UUID
    REFERENCES finance_control_assessments(id) ON DELETE CASCADE,
  evidence_reference VARCHAR(120) NOT NULL UNIQUE,
  evidence_type VARCHAR(40) NOT NULL,
  title VARCHAR(220) NOT NULL,
  source_type VARCHAR(60),
  source_id UUID,
  storage_key TEXT,
  content_hash VARCHAR(128),
  confidentiality VARCHAR(30) NOT NULL DEFAULT 'internal',
  retention_until DATE,
  collected_by UUID REFERENCES users(id) ON DELETE SET NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_audit_evidence_retention_idx
  ON finance_audit_evidence(retention_until);

CREATE TABLE IF NOT EXISTS finance_audit_findings (
  id UUID PRIMARY KEY,
  engagement_id UUID NOT NULL
    REFERENCES finance_audit_engagements(id) ON DELETE CASCADE,
  assessment_id UUID
    REFERENCES finance_control_assessments(id) ON DELETE SET NULL,
  finding_reference VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(220) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  root_cause VARCHAR(1500),
  impact VARCHAR(1500),
  severity VARCHAR(20) NOT NULL,
  risk_rating VARCHAR(20) NOT NULL,
  recurrence_key VARCHAR(120),
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  management_response VARCHAR(2000),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_date DATE,
  closed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_audit_findings_queue_idx
  ON finance_audit_findings(status, severity, target_date);

CREATE TABLE IF NOT EXISTS finance_remediation_actions (
  id UUID PRIMARY KEY,
  finding_id UUID NOT NULL
    REFERENCES finance_audit_findings(id) ON DELETE CASCADE,
  action_reference VARCHAR(120) NOT NULL UNIQUE,
  action_title VARCHAR(220) NOT NULL,
  action_description VARCHAR(2000),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  completion_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  verification_notes VARCHAR(1500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_remediation_due_idx
  ON finance_remediation_actions(status, due_date);

CREATE TABLE IF NOT EXISTS finance_continuous_control_results (
  id UUID PRIMARY KEY,
  control_key VARCHAR(120) NOT NULL,
  run_reference VARCHAR(120) NOT NULL UNIQUE,
  test_name VARCHAR(180) NOT NULL,
  test_period_from TIMESTAMPTZ NOT NULL,
  test_period_to TIMESTAMPTZ NOT NULL,
  population_size INTEGER NOT NULL DEFAULT 0,
  exceptions_count INTEGER NOT NULL DEFAULT 0,
  result VARCHAR(30) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
