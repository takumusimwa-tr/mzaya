CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL UNIQUE,
  original_name VARCHAR(255) NOT NULL,
  normalized_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  declared_size BIGINT NOT NULL,
  uploaded_size BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS upload_sessions_expiry_idx
  ON upload_sessions(status, expires_at);

CREATE INDEX IF NOT EXISTS upload_sessions_user_idx
  ON upload_sessions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  upload_session_id UUID REFERENCES upload_sessions(id) ON DELETE SET NULL,
  storage_key TEXT NOT NULL UNIQUE,
  thumbnail_key TEXT,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  media_kind VARCHAR(30) NOT NULL,
  byte_size BIGINT NOT NULL,
  duration_ms INTEGER,
  width INTEGER,
  height INTEGER,
  waveform JSONB,
  scan_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  status VARCHAR(30) NOT NULL DEFAULT 'processing',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS message_attachments_message_idx
  ON message_attachments(message_id, created_at);

CREATE INDEX IF NOT EXISTS message_attachments_processing_idx
  ON message_attachments(status, scan_status, created_at);
