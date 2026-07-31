CREATE TABLE IF NOT EXISTS push_devices (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(20) NOT NULL,
  push_token TEXT NOT NULL,
  device_id VARCHAR(180),
  app_version VARCHAR(40),
  locale VARCHAR(20),
  timezone VARCHAR(60),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(push_token)
);

CREATE INDEX IF NOT EXISTS push_devices_user_idx
  ON push_devices(user_id, is_active);

CREATE TABLE IF NOT EXISTS message_notification_state (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_notified_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  last_notified_at TIMESTAMPTZ,
  muted_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_notification_state_user_idx
  ON message_notification_state(user_id, unread_count DESC);

CREATE TABLE IF NOT EXISTS push_delivery_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES push_devices(id) ON DELETE SET NULL,
  event_key VARCHAR(80) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  provider VARCHAR(40),
  provider_message_id VARCHAR(180),
  error_message VARCHAR(500),
  attempted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS push_delivery_log_status_idx
  ON push_delivery_log(status, created_at);
