CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL UNIQUE
    REFERENCES conversations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  order_id UUID NULL
    REFERENCES orders(id) ON DELETE SET NULL,
  assigned_agent_id UUID NULL
    REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  subject VARCHAR(180) NOT NULL,
  resolution_summary TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_tickets_queue_idx
  ON support_tickets(status, priority, created_at);

CREATE INDEX IF NOT EXISTS support_tickets_agent_idx
  ON support_tickets(assigned_agent_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS support_tickets_customer_idx
  ON support_tickets(customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS support_internal_notes (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL
    REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  body TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_internal_notes_ticket_idx
  ON support_internal_notes(ticket_id, created_at DESC);

CREATE TABLE IF NOT EXISTS support_ticket_audit (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL
    REFERENCES support_tickets(id) ON DELETE CASCADE,
  actor_id UUID NULL
    REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(60) NOT NULL,
  previous_value JSONB,
  new_value JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS support_ticket_audit_ticket_idx
  ON support_ticket_audit(ticket_id, created_at DESC);
