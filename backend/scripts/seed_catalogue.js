// backend/scripts/seed_catalogue.js
//
// Seeds food, grocery and materials vendors so every browse tab has something
// real to show on a fresh database. (Food used to be skipped on the assumption a
// local DB already had Chicken Inn — a fresh staging DB has nothing.)
//
// Deliberately Zimbabwean: brands people actually shop at, products they actually
// buy, prices in the range they actually pay (USD, mid-2026). A demo catalogue of
// "Product A / Product B" tells you nothing about whether the UI works.
//
// Idempotent — safe to run repeatedly. It finds-or-creates by name.
//
//   node scripts/seed_catalogue.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { sequelize } = require('../src/config/db');
const { Brand, Vendor, MenuItem, City, User } = require('../src/models/associations');

// ─── The catalogue ────────────────────────────────────────────────────────────
const CATALOGUE = [
  // ══ FOOD ══
  {
    brand: { name: 'Chicken Inn', category: 'food', description: 'Fried chicken, chips and burgers. A Zimbabwean favourite.' },
    branch: { branch_name: 'Chicken Inn Samora Machel', address: 'Samora Machel Ave, Harare CBD', phone: '0242700100', location: { lat: -17.8277, lng: 31.0480 } },
    items: [
      { name: '2 Piece Chicken & Chips', description: 'Two pieces of crispy fried chicken with regular chips', price_usd: 5.50, weight_kg: 0.5, category: 'Meals',  prep_minutes: 15 },
      { name: 'Streetwise 2',            description: 'Two pieces, chips and a soft drink',                   price_usd: 6.00, weight_kg: 0.7, category: 'Combos', prep_minutes: 15 },
      { name: 'Chicken Burger',          description: 'Crumbed fillet, lettuce, mayo on a toasted bun',      price_usd: 4.50, weight_kg: 0.3, category: 'Burgers', prep_minutes: 12 },
      { name: '8 Piece Family Bucket',   description: 'Eight pieces of chicken with large chips',             price_usd: 17.00, weight_kg: 1.8, category: 'Family', prep_minutes: 20 },
      { name: 'Large Chips',             description: 'Golden crispy chips',                                  price_usd: 2.50, weight_kg: 0.3, category: 'Sides',  prep_minutes: 8 },
      { name: 'Coca-Cola 500ml',         description: 'Ice cold',                                             price_usd: 1.00, weight_kg: 0.5, category: 'Drinks', prep_minutes: 2 },
    ],
  },
  {
    brand: { name: 'Pizza Inn', category: 'food', description: 'Hot, freshly baked pizzas with generous toppings.' },
    branch: { branch_name: 'Pizza Inn Avondale', address: 'King George Rd, Avondale, Harare', phone: '0242335100', location: { lat: -17.8005, lng: 31.0390 } },
    items: [
      { name: 'Regular Something Meaty',  description: 'Beef, ham, pepperoni and mozzarella',  price_usd: 8.00, weight_kg: 0.6, category: 'Pizzas', prep_minutes: 20 },
      { name: 'Regular Chicken Mayo',     description: 'Chicken strips, mayo, mozzarella',     price_usd: 7.50, weight_kg: 0.6, category: 'Pizzas', prep_minutes: 20 },
      { name: 'Large Margherita',         description: 'Tomato, mozzarella and oregano',       price_usd: 9.00, weight_kg: 0.9, category: 'Pizzas', prep_minutes: 20 },
      { name: 'Garlic Bread',             description: 'Toasted with garlic butter',           price_usd: 2.50, weight_kg: 0.2, category: 'Sides',  prep_minutes: 10 },
      { name: 'Two-for-One Deal',         description: 'Two regular pizzas of your choice',    price_usd: 13.00, weight_kg: 1.2, category: 'Deals', prep_minutes: 25 },
    ],
  },
  {
    brand: { name: "Gogo's Kitchen", category: 'food', description: 'Home-style sadza, stews and traditional favourites.' },
    branch: { branch_name: "Gogo's Kitchen Belvedere", address: 'Bishop Gaul Ave, Belvedere, Harare', phone: '0772555010', location: { lat: -17.8330, lng: 31.0180 } },
    items: [
      { name: 'Sadza & Beef Stew',      description: 'Fresh sadza with slow-cooked beef and greens', price_usd: 4.00, weight_kg: 0.7, category: 'Mains', prep_minutes: 15 },
      { name: 'Sadza & Road Runner',    description: 'Free-range village chicken stew',             price_usd: 5.50, weight_kg: 0.7, category: 'Mains', prep_minutes: 20 },
      { name: 'Sadza & Matemba',        description: 'Crispy kapenta with tomato and onion relish', price_usd: 3.50, weight_kg: 0.6, category: 'Mains', prep_minutes: 15 },
      { name: 'Muriwo une Dovi',        description: 'Greens in peanut butter sauce',               price_usd: 2.00, weight_kg: 0.3, category: 'Sides', prep_minutes: 10 },
      { name: 'Maheu 500ml',            description: 'Traditional sorghum drink',                   price_usd: 1.20, weight_kg: 0.5, category: 'Drinks', prep_minutes: 2 },
    ],
  },
  // ══ GROCERY ══
  {
    brand: {
      name: 'OK Zimbabwe',
      category: 'grocery',
      description: 'Everyday groceries, household essentials and fresh produce.',
    },
    branch: {
      branch_name: 'OK First Street',
      address: 'First Street, Harare CBD',
      phone: '0242758000',
      location: { lat: -17.8292, lng: 31.0522 },
    },
    items: [
      { name: 'Mealie Meal 10kg',      description: 'Roller meal, the staple',            price_usd: 8.50,  weight_kg: 10,   category: 'Staples', prep_minutes: 10 },
      { name: 'Cooking Oil 2L',        description: 'Sunflower cooking oil',                price_usd: 4.20,  weight_kg: 2,    category: 'Staples', prep_minutes: 10 },
      { name: 'White Sugar 2kg',       description: 'Refined white sugar',                  price_usd: 2.80,  weight_kg: 2,    category: 'Staples', prep_minutes: 10 },
      { name: 'Bread (Standard Loaf)', description: 'Fresh white bread',                    price_usd: 1.00,  weight_kg: 0.7,  category: 'Bakery',  prep_minutes: 10 },
      { name: 'Fresh Milk 1L',         description: 'Pasteurised full cream milk',          price_usd: 1.50,  weight_kg: 1,    category: 'Dairy',   prep_minutes: 10 },
      { name: 'Rice 5kg',              description: 'Long grain white rice',                price_usd: 6.00,  weight_kg: 5,    category: 'Staples', prep_minutes: 10 },
      { name: 'Eggs (Tray of 30)',     description: 'Farm fresh eggs',                      price_usd: 4.50,  weight_kg: 1.8,  category: 'Dairy',   prep_minutes: 10 },
      { name: 'Washing Powder 2kg',    description: 'Laundry detergent',                    price_usd: 3.90,  weight_kg: 2,    category: 'Household', prep_minutes: 10 },
    ],
  },
  {
    brand: {
      name: 'TM Pick n Pay',
      category: 'grocery',
      description: 'Fresh food, groceries and household goods.',
    },
    branch: {
      branch_name: 'TM Borrowdale',
      address: 'Borrowdale Road, Harare',
      phone: '0242885500',
      location: { lat: -17.7580, lng: 31.0965 },
    },
    items: [
      { name: 'Chicken (Whole, 1.2kg)', description: 'Fresh whole chicken',         price_usd: 5.50, weight_kg: 1.2, category: 'Meat',    prep_minutes: 10 },
      { name: 'Beef Stew 1kg',          description: 'Fresh beef, cubed',           price_usd: 7.80, weight_kg: 1,   category: 'Meat',    prep_minutes: 10 },
      { name: 'Tomatoes 1kg',           description: 'Fresh tomatoes',              price_usd: 1.20, weight_kg: 1,   category: 'Produce', prep_minutes: 10 },
      { name: 'Onions 2kg',             description: 'Brown onions',                price_usd: 1.80, weight_kg: 2,   category: 'Produce', prep_minutes: 10 },
      { name: 'Potatoes 5kg',           description: 'Fresh potatoes',              price_usd: 3.50, weight_kg: 5,   category: 'Produce', prep_minutes: 10 },
      { name: 'Mazoe Orange Crush 2L',  description: 'The national drink',          price_usd: 3.20, weight_kg: 2,   category: 'Drinks',  prep_minutes: 10 },
      { name: 'Cascade Juice 1L',       description: 'Mixed fruit juice',           price_usd: 1.60, weight_kg: 1,   category: 'Drinks',  prep_minutes: 10 },
    ],
  },

  // ══ MATERIALS ══
  {
    brand: {
      name: 'Halsteds Builders Express',
      category: 'materials',
      description: 'Building materials, hardware and tools.',
    },
    branch: {
      branch_name: 'Halsteds Msasa',
      address: 'Mutare Road, Msasa, Harare',
      phone: '0242486000',
      location: { lat: -17.8450, lng: 31.1290 },
    },
    items: [
      { name: 'Cement 50kg (PPC)',        description: 'PPC Portland cement, 50kg bag',      price_usd: 9.50,  weight_kg: 50,  category: 'Cement',    prep_minutes: 20 },
      { name: 'River Sand (1 tonne)',     description: 'Washed river sand, per tonne',       price_usd: 25.00, weight_kg: 1000, category: 'Aggregates', prep_minutes: 30 },
      { name: 'Quarry Stone (1 tonne)',   description: '19mm crushed stone',                 price_usd: 30.00, weight_kg: 1000, category: 'Aggregates', prep_minutes: 30 },
      { name: 'Common Bricks (per 1000)', description: 'Standard common bricks',             price_usd: 90.00, weight_kg: 3000, category: 'Bricks',    prep_minutes: 45 },
      { name: 'Steel Rebar Y10 (6m)',     description: '10mm high-tensile reinforcing bar',  price_usd: 6.80,  weight_kg: 3.7, category: 'Steel',     prep_minutes: 20 },
      { name: 'Roofing Sheet IBR (3m)',   description: '0.47mm galvanised IBR sheet',        price_usd: 18.00, weight_kg: 8,   category: 'Roofing',   prep_minutes: 20 },
      { name: 'PVC Pipe 110mm (6m)',      description: 'Sewer-grade PVC pipe',               price_usd: 14.50, weight_kg: 6,   category: 'Plumbing',  prep_minutes: 20 },
    ],
  },
  {
    brand: {
      name: 'Electrosales Hardware',
      category: 'materials',
      description: 'Electrical, plumbing and general hardware.',
    },
    branch: {
      branch_name: 'Electrosales Graniteside',
      address: 'Seke Road, Graniteside, Harare',
      phone: '0242771234',
      location: { lat: -17.8480, lng: 31.0480 },
    },
    items: [
      { name: 'Electrical Cable 2.5mm (100m)', description: 'Twin and earth, 100m roll',   price_usd: 45.00, weight_kg: 12, category: 'Electrical', prep_minutes: 20 },
      { name: 'LED Bulb 9W (Pack of 4)',       description: 'Warm white, E27 fitting',     price_usd: 5.00,  weight_kg: 0.3, category: 'Electrical', prep_minutes: 15 },
      { name: 'Wall Socket (Double)',          description: '16A double wall socket',      price_usd: 4.20,  weight_kg: 0.3, category: 'Electrical', prep_minutes: 15 },
      { name: 'Geyser Element 2kW',            description: 'Replacement geyser element',  price_usd: 12.00, weight_kg: 0.8, category: 'Plumbing',   prep_minutes: 15 },
      { name: 'Tap (Mixer, Chrome)',           description: 'Chrome basin mixer tap',      price_usd: 22.00, weight_kg: 1.2, category: 'Plumbing',   prep_minutes: 15 },
      { name: 'Paint 20L (White PVA)',         description: 'Interior white PVA, 20L',     price_usd: 38.00, weight_kg: 25, category: 'Paint',      prep_minutes: 20 },
    ],
  },
];

const DEFAULT_HOURS = {
  monday:    { open: '08:00', close: '18:00', closed: false },
  tuesday:   { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday:  { open: '08:00', close: '18:00', closed: false },
  friday:    { open: '08:00', close: '18:00', closed: false },
  saturday:  { open: '08:00', close: '16:00', closed: false },
  sunday:    { open: '09:00', close: '13:00', closed: false },
};

async function seed() {
  await sequelize.authenticate();
  console.log('Connected.\n');

  // Everything hangs off a city and an owner.
  const harare = await City.findOne({ where: { slug: 'harare' } });
  if (!harare) {
    console.error('No "harare" city found. Seed cities first (POST /api/cities/seed).');
    process.exit(1);
  }

  // Attach these to an existing vendor user so the console works if you log in as
  // them. Falls back to any admin.
  let owner = await User.findOne({ where: { role: 'vendor' } });
  if (!owner) owner = await User.findOne({ where: { role: 'admin' } });
  if (!owner) {
    console.error('No vendor or admin user to own these branches. Register one first.');
    process.exit(1);
  }
  console.log(`Owner: ${owner.name} (${owner.phone})\n`);

  for (const entry of CATALOGUE) {
    // ── Brand ──
    const [brand, brandNew] = await Brand.findOrCreate({
      where: { name: entry.brand.name },
      defaults: {
        ...entry.brand,
        owner_id: owner.id,
        is_active: true,
        rating: 0,
      },
    });
    console.log(`${brandNew ? '+ brand  ' : '· brand  '} ${brand.name}`);

    // ── Branch ──
    const [branch, branchNew] = await Vendor.findOrCreate({
      where: { brand_id: brand.id, branch_name: entry.branch.branch_name },
      defaults: {
        owner_id:      owner.id,
        brand_id:      brand.id,
        branch_name:   entry.branch.branch_name,
        city_id:       harare.id,
        name:          brand.name,             // display name = the brand
        category:      entry.brand.category,
        description:   entry.brand.description,
        phone:         entry.branch.phone,
        address:       entry.branch.address,
        location:      entry.branch.location,
        opening_hours: DEFAULT_HOURS,
        is_active:     true,   // pre-approved — these are seeds, not applications
        is_open:       true,
        is_paused:     false,
      },
    });
    console.log(`${branchNew ? '  + branch' : '  · branch'} ${branch.branch_name}`);

    // ── Items ──
    let added = 0;
    for (const item of entry.items) {
      const [, itemNew] = await MenuItem.findOrCreate({
        where: { vendor_id: branch.id, name: item.name },
        defaults: {
          vendor_id:    branch.id,
          ...item,
          is_available: true,
        },
      });
      if (itemNew) added++;
    }
    console.log(`  → ${added} new item(s), ${entry.items.length} total\n`);
  }

  console.log('Done. Grocery and materials carousels now have real products.');
  console.log('\nNOTE: items have no images. The carousel will show placeholder');
  console.log('icons until vendors upload photos — which is honest, and exactly');
  console.log('what a real vendor sees before they add pictures.');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
