-- Create a vendor owner user for Halsteds
INSERT INTO users (id, name, phone, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Halsteds Manager',
  '0772222222',
  '$2b$10$2Zeg4SKoCMwdr9b0aakSseFI3ZBGgqv0ZqO.OJHpoAqyhc7gmfpmW',
  'vendor',
  NOW(), NOW()
)
ON CONFLICT (phone) DO NOTHING;

-- Create the Halsteds vendor in Bulawayo (materials category)
INSERT INTO vendors (id, owner_id, city_id, name, category, description, phone, address, is_active, is_open, rating, total_orders, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  '33d3b120-9bd8-4d66-8819-bbc9a706634d',
  'Halsteds Building Supplies',
  'materials',
  'Quality building materials, hardware and tools',
  '0772222222',
  'Fife St, Bulawayo CBD',
  true,
  true,
  0,
  0,
  NOW(), NOW()
FROM users u
WHERE u.phone = '0772222222';

-- Add menu items (building materials)
INSERT INTO menu_items (id, vendor_id, name, description, price_usd, weight_kg, category, is_available, "createdAt", "updatedAt")
SELECT gen_random_uuid(), v.id, item.name, item.description, item.price, item.weight, item.cat, true, NOW(), NOW()
FROM vendors v
CROSS JOIN (VALUES
  ('PPC Cement 50kg', 'Premium grade cement bag', 12.00, 50.0, 'Cement'),
  ('River Sand (per m3)', 'Washed river sand', 35.00, 1500.0, 'Aggregates'),
  ('Quarry Stone (per m3)', '19mm crushed stone', 40.00, 1600.0, 'Aggregates'),
  ('Brick Force (per roll)', 'Galvanized brick reinforcing', 8.50, 5.0, 'Steel'),
  ('Y10 Rebar (per length)', '10mm reinforcing bar 6m', 9.00, 9.0, 'Steel'),
  ('Roofing Sheet IBR 3.6m', 'Galvanized IBR roofing sheet', 22.00, 12.0, 'Roofing'),
  ('Wheelbarrow', 'Heavy duty builder wheelbarrow', 45.00, 15.0, 'Tools'),
  ('Cement Trowel', 'Stainless steel plastering trowel', 7.50, 0.5, 'Tools')
) AS item(name, description, price, weight, cat)
WHERE v.name = 'Halsteds Building Supplies';
