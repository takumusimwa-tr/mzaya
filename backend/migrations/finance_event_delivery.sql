-- Mzaya Batch 08.4.8
-- Transactional outbox, delivery attempts, leases, dead-letter handling,
-- consumer offsets, recovery, and reliability snapshots.

CREATE TABLE IF NOT EXISTS finance_outbox_events (
  id UUID PRIMARY KEY,
  aggregate_type VARCHAR(80) NOT NULL,
  aggregate_id UUID,
  event_type VARCHAR(120) NOT NULL,
  event_key VARCHAR(160) NOT NULL UNIQUE,
  source_system VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  payload_hash VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(180) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error VARCHAR(1500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_outbox_events_publish_idx
  ON finance_outbox_events(status, available_at, created_at);

CREATE TABLE IF NOT EXISTS finance_delivery_leases (
  id UUID PRIMARY KEY,
  outbox_event_id UUID NOT NULL
    REFERENCES finance_outbox_events(id) ON DELETE CASCADE,
  lease_owner VARCHAR(120) NOT NULL,
  leased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lease_expires_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(outbox_event_id, status)
);

CREATE INDEX IF NOT EXISTS finance_delivery_leases_expiry_idx
  ON finance_delivery_leases(status, lease_expires_at);

CREATE TABLE IF NOT EXISTS finance_delivery_attempts (
  id UUID PRIMARY KEY,
  outbox_event_id UUID NOT NULL
    REFERENCES finance_outbox_events(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  worker_id VARCHAR(120),
  destination VARCHAR(120) NOT NULL DEFAULT 'finance_event_engine',
  status VARCHAR(30) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  response_reference VARCHAR(180),
  error_code VARCHAR(100),
  error_message VARCHAR(1500),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(outbox_event_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS finance_consumer_offsets (
  id UUID PRIMARY KEY,
  consumer_key VARCHAR(120) NOT NULL,
  partition_key VARCHAR(120) NOT NULL DEFAULT 'default',
  last_event_id UUID,
  last_event_created_at TIMESTAMPTZ,
  last_processed_at TIMESTAMPTZ,
  lag_seconds INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(consumer_key, partition_key)
);

CREATE TABLE IF NOT EXISTS finance_dead_letters (
  id UUID PRIMARY KEY,
  outbox_event_id UUID NOT NULL
    REFERENCES finance_outbox_events(id) ON DELETE CASCADE,
  dead_letter_reference VARCHAR(140) NOT NULL UNIQUE,
  reason_code VARCHAR(100) NOT NULL,
  reason VARCHAR(1500) NOT NULL,
  attempt_count INTEGER NOT NULL,
  first_failed_at TIMESTAMPTZ,
  quarantined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(30) NOT NULL DEFAULT 'quarantined',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  replay_requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
  replay_requested_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(outbox_event_id, status)
);

CREATE INDEX IF NOT EXISTS finance_dead_letters_queue_idx
  ON finance_dead_letters(status, quarantined_at);

CREATE TABLE IF NOT EXISTS finance_reliability_snapshots (
  id UUID PRIMARY KEY,
  snapshot_at TIMESTAMPTZ NOT NULL,
  source_system VARCHAR(80),
  pending_count INTEGER NOT NULL DEFAULT 0,
  published_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  dead_letter_count INTEGER NOT NULL DEFAULT 0,
  oldest_pending_age_seconds INTEGER NOT NULL DEFAULT 0,
  avg_delivery_latency_ms NUMERIC(18,4),
  p95_delivery_latency_ms NUMERIC(18,4),
  duplicate_delivery_count INTEGER NOT NULL DEFAULT 0,
  stale_lease_count INTEGER NOT NULL DEFAULT 0,
  consumer_lag_seconds INTEGER NOT NULL DEFAULT 0,
  health_status VARCHAR(20) NOT NULL DEFAULT 'healthy',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS finance_reliability_snapshots_time_idx
  ON finance_reliability_snapshots(snapshot_at DESC);
