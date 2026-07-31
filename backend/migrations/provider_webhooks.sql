-- Mzaya Batch 08.1.5
-- Durable provider webhook ingestion, replay protection, processing history,
-- and automated reconciliation scheduling.

CREATE TABLE IF NOT EXISTS provider_webhook_events (
  id UUID PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  provider_event_id VARCHAR(180) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  signature_valid BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(30) NOT NULL DEFAULT 'received',
  attempt_count INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_started_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  last_error VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_event_id)
);

CREATE INDEX IF NOT EXISTS provider_webhook_events_queue_idx
  ON provider_webhook_events(status, next_attempt_at, received_at);

CREATE INDEX IF NOT EXISTS provider_webhook_events_type_idx
  ON provider_webhook_events(provider, event_type, received_at DESC);

CREATE TABLE IF NOT EXISTS provider_webhook_attempts (
  id UUID PRIMARY KEY,
  webhook_event_id UUID NOT NULL
    REFERENCES provider_webhook_events(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL,
  error_message VARCHAR(1000),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(webhook_event_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS provider_webhook_attempts_event_idx
  ON provider_webhook_attempts(webhook_event_id, attempt_number);

CREATE TABLE IF NOT EXISTS reconciliation_runs (
  id UUID PRIMARY KEY,
  provider VARCHAR(40) NOT NULL,
  run_reference VARCHAR(120) NOT NULL UNIQUE,
  statement_date DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  record_count INTEGER NOT NULL DEFAULT 0,
  matched_count INTEGER NOT NULL DEFAULT 0,
  unmatched_count INTEGER NOT NULL DEFAULT 0,
  discrepancy_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message VARCHAR(1000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reconciliation_runs_provider_idx
  ON reconciliation_runs(provider, created_at DESC);
