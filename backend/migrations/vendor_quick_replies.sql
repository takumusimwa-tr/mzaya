CREATE TABLE IF NOT EXISTS vendor_quick_replies (
  id UUID PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(40) NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vendor_quick_replies_vendor_idx
  ON vendor_quick_replies(vendor_id, is_active, sort_order);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_quick_replies_unique_label
  ON vendor_quick_replies(vendor_id, LOWER(label))
  WHERE is_active = TRUE;
