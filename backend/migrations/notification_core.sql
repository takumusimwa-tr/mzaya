-- Mzaya Batch 07.1.1 — notification core
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_key VARCHAR(80) NOT NULL,
  category VARCHAR(40) NOT NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'normal',
  title VARCHAR(140) NOT NULL,
  body VARCHAR(500) NOT NULL,
  icon VARCHAR(80),
  action_url TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON notifications(user_id, read_at)
  WHERE read_at IS NULL AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  provider VARCHAR(40),
  provider_message_id VARCHAR(180),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error VARCHAR(500),
  next_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(notification_id, channel)
);

CREATE INDEX IF NOT EXISTS notification_deliveries_retry_idx
  ON notification_deliveries(status, next_attempt_at);
