CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  provider VARCHAR(40),
  provider_refund_reference VARCHAR(180),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL,
  reason VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'requested',
  request_notes VARCHAR(1000),
  decision_notes VARCHAR(1000),
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS refunds_payment_idx
  ON refunds(payment_id, created_at DESC);

CREATE INDEX IF NOT EXISTS refunds_status_idx
  ON refunds(status, requested_at);

CREATE TABLE IF NOT EXISTS refund_audit (
  id UUID PRIMARY KEY,
  refund_id UUID NOT NULL REFERENCES refunds(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS refund_audit_refund_idx
  ON refund_audit(refund_id, created_at ASC);

CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  payment_id UUID,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  subject VARCHAR(180) NOT NULL,
  customer_statement TEXT NOT NULL,
  vendor_response TEXT,
  resolution VARCHAR(80),
  resolution_notes TEXT,
  response_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS disputes_queue_idx
  ON disputes(status, priority, created_at);

CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  evidence_type VARCHAR(40) NOT NULL,
  attachment_id UUID REFERENCES message_attachments(id) ON DELETE SET NULL,
  notes VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dispute_evidence_dispute_idx
  ON dispute_evidence(dispute_id, created_at);

CREATE TABLE IF NOT EXISTS dispute_timeline (
  id UUID PRIMARY KEY,
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(60) NOT NULL,
  body VARCHAR(1200),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS dispute_timeline_dispute_idx
  ON dispute_timeline(dispute_id, created_at ASC);

CREATE TABLE IF NOT EXISTS chargebacks (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider VARCHAR(40) NOT NULL,
  provider_case_reference VARCHAR(180) NOT NULL,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency VARCHAR(3) NOT NULL,
  reason_code VARCHAR(80),
  status VARCHAR(30) NOT NULL DEFAULT 'received',
  response_due_at TIMESTAMPTZ,
  represented_at TIMESTAMPTZ,
  won_at TIMESTAMPTZ,
  lost_at TIMESTAMPTZ,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_case_reference)
);

CREATE INDEX IF NOT EXISTS chargebacks_status_idx
  ON chargebacks(status, response_due_at);
