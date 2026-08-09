-- Mzaya Batch 08.4.7
-- Finance integration hub and accounting event engine.
-- Purpose: route operational business events through controlled posting rules
-- before anything reaches the immutable ledger.

CREATE TABLE IF NOT EXISTS finance_business_events (
  id UUID PRIMARY KEY,
  event_key VARCHAR(140) NOT NULL UNIQUE,
  event_type VARCHAR(120) NOT NULL,
  source_system VARCHAR(80) NOT NULL,
  source_entity_type VARCHAR(80),
  source_entity_id UUID,
  source_reference VARCHAR(180),
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  currency VARCHAR(3),
  amount_minor BIGINT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_hash VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(180) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'received',
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason VARCHAR(1500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_business_events_status_idx
  ON finance_business_events(status, received_at);

CREATE INDEX IF NOT EXISTS finance_business_events_source_idx
  ON finance_business_events(source_system, source_entity_type, source_entity_id);

CREATE TABLE IF NOT EXISTS finance_posting_rules (
  id UUID PRIMARY KEY,
  rule_key VARCHAR(120) NOT NULL UNIQUE,
  event_type VARCHAR(120) NOT NULL,
  source_system VARCHAR(80),
  priority INTEGER NOT NULL DEFAULT 100,
  condition_expression JSONB NOT NULL DEFAULT '{}'::jsonb,
  posting_template_key VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_posting_rules_match_idx
  ON finance_posting_rules(event_type, source_system, status, priority);

CREATE TABLE IF NOT EXISTS finance_posting_templates (
  id UUID PRIMARY KEY,
  template_key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description VARCHAR(1000),
  currency_source VARCHAR(60) NOT NULL DEFAULT 'event.currency',
  reference_source VARCHAR(120) NOT NULL DEFAULT 'event.event_key',
  lines JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  version_number INTEGER NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_accounting_events (
  id UUID PRIMARY KEY,
  business_event_id UUID NOT NULL
    REFERENCES finance_business_events(id) ON DELETE RESTRICT,
  posting_rule_id UUID
    REFERENCES finance_posting_rules(id) ON DELETE SET NULL,
  posting_template_id UUID
    REFERENCES finance_posting_templates(id) ON DELETE SET NULL,
  accounting_reference VARCHAR(140) NOT NULL UNIQUE,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'prepared',
  debit_total_minor BIGINT NOT NULL DEFAULT 0,
  credit_total_minor BIGINT NOT NULL DEFAULT 0,
  balanced BOOLEAN NOT NULL DEFAULT FALSE,
  journal_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ledger_transaction_id UUID
    REFERENCES ledger_transactions(id) ON DELETE SET NULL,
  prepared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  failure_reason VARCHAR(1500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_event_id)
);

CREATE TABLE IF NOT EXISTS finance_journal_batches (
  id UUID PRIMARY KEY,
  batch_reference VARCHAR(140) NOT NULL UNIQUE,
  batch_type VARCHAR(40) NOT NULL DEFAULT 'automatic',
  period_key VARCHAR(30) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  event_count INTEGER NOT NULL DEFAULT 0,
  debit_total_minor BIGINT NOT NULL DEFAULT 0,
  credit_total_minor BIGINT NOT NULL DEFAULT 0,
  balanced BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  posted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  posted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_journal_batch_events (
  id UUID PRIMARY KEY,
  journal_batch_id UUID NOT NULL
    REFERENCES finance_journal_batches(id) ON DELETE CASCADE,
  accounting_event_id UUID NOT NULL
    REFERENCES finance_accounting_events(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(journal_batch_id, accounting_event_id)
);

CREATE TABLE IF NOT EXISTS finance_posting_failures (
  id UUID PRIMARY KEY,
  business_event_id UUID
    REFERENCES finance_business_events(id) ON DELETE CASCADE,
  accounting_event_id UUID
    REFERENCES finance_accounting_events(id) ON DELETE CASCADE,
  failure_code VARCHAR(100) NOT NULL,
  failure_stage VARCHAR(60) NOT NULL,
  error_message VARCHAR(1500) NOT NULL,
  error_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  first_occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_posting_failures_queue_idx
  ON finance_posting_failures(status, last_occurred_at);

CREATE TABLE IF NOT EXISTS finance_replay_queue (
  id UUID PRIMARY KEY,
  business_event_id UUID NOT NULL
    REFERENCES finance_business_events(id) ON DELETE CASCADE,
  replay_reason VARCHAR(500) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'queued',
  attempts INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failure_reason VARCHAR(1500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_event_id, status)
);

CREATE INDEX IF NOT EXISTS finance_replay_queue_ready_idx
  ON finance_replay_queue(status, next_attempt_at);

CREATE TABLE IF NOT EXISTS finance_integration_logs (
  id UUID PRIMARY KEY,
  business_event_id UUID
    REFERENCES finance_business_events(id) ON DELETE CASCADE,
  stage VARCHAR(60) NOT NULL,
  status VARCHAR(30) NOT NULL,
  message VARCHAR(1000),
  duration_ms INTEGER,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_integration_logs_event_idx
  ON finance_integration_logs(business_event_id, occurred_at);
