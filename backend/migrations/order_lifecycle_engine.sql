BEGIN;

CREATE TABLE IF NOT EXISTS order_timelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status varchar(50),
  to_status varchar(50) NOT NULL,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  actor_role varchar(30),
  note varchar(500),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_timelines_order_created
  ON order_timelines(order_id, "createdAt");

-- Backfill one initial lifecycle event for existing orders.
INSERT INTO order_timelines (order_id, from_status, to_status, actor_id, actor_role, note, "createdAt")
SELECT o.id, NULL, o.status, o.customer_id, 'customer', 'Lifecycle baseline', o."createdAt"
FROM orders o
WHERE NOT EXISTS (
  SELECT 1 FROM order_timelines t WHERE t.order_id = o.id
);

COMMIT;
