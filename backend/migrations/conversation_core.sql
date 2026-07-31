CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY,
  type VARCHAR(30) NOT NULL DEFAULT 'order',
  order_id UUID NULL REFERENCES orders(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(160),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_order_idx
  ON conversations(order_id);

CREATE INDEX IF NOT EXISTS conversations_last_message_idx
  ON conversations(last_message_at DESC);

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL
    REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL
    REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  muted_until TIMESTAMPTZ,
  last_read_message_id UUID,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS conversation_participants_user_idx
  ON conversation_participants(user_id, conversation_id);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL
    REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  client_message_id VARCHAR(100),
  type VARCHAR(30) NOT NULL DEFAULT 'text',
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  reply_to_message_id UUID NULL
    REFERENCES messages(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS messages_client_id_unique
  ON messages(sender_id, client_message_id)
  WHERE client_message_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON messages(conversation_id, created_at DESC);

ALTER TABLE conversation_participants
  DROP CONSTRAINT IF EXISTS conversation_participants_last_read_fk;

ALTER TABLE conversation_participants
  ADD CONSTRAINT conversation_participants_last_read_fk
  FOREIGN KEY (last_read_message_id)
  REFERENCES messages(id)
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS message_receipts (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS message_receipts_user_idx
  ON message_receipts(user_id, read_at);
