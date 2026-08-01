CREATE TABLE IF NOT EXISTS financial_control_policies (
  id UUID PRIMARY KEY,
  policy_key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  resource_type VARCHAR(60) NOT NULL,
  action VARCHAR(80) NOT NULL,
  currency VARCHAR(3),
  threshold_minor BIGINT,
  required_approvals INTEGER NOT NULL DEFAULT 1,
  require_distinct_creator BOOLEAN NOT NULL DEFAULT TRUE,
  approver_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_approval_requests (
  id UUID PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES financial_control_policies(id),
  resource_type VARCHAR(60) NOT NULL,
  resource_id UUID,
  action VARCHAR(80) NOT NULL,
  requested_by UUID NOT NULL REFERENCES users(id),
  amount_minor BIGINT,
  currency VARCHAR(3),
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  required_approvals INTEGER NOT NULL,
  approval_count INTEGER NOT NULL DEFAULT 0,
  rejection_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  execution_result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_approval_decisions (
  id UUID PRIMARY KEY,
  approval_request_id UUID NOT NULL REFERENCES financial_approval_requests(id) ON DELETE CASCADE,
  decided_by UUID NOT NULL REFERENCES users(id),
  decision VARCHAR(20) NOT NULL,
  notes VARCHAR(1000),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(approval_request_id, decided_by)
);

CREATE TABLE IF NOT EXISTS financial_control_exceptions (
  id UUID PRIMARY KEY,
  approval_request_id UUID REFERENCES financial_approval_requests(id),
  exception_type VARCHAR(60) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  summary VARCHAR(300) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes VARCHAR(1500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
