// backend/tests/setup.js
//
// Test factories and lifecycle. The ENVIRONMENT bootstrap (NODE_ENV, mock
// payments, test DB URL) lives in env.js, which Jest runs via setupFiles BEFORE
// this file or any test module loads. That ordering matters: the test files
// require app.js on line 2, before they require this module, so env setup had to
// move even earlier — into setupFiles — or app.js loads with the wrong config.
//
// By the time anything here runs, the environment is already correct.

const { sequelize } = require('../src/config/db');
const models = require('../src/models/associations');
const bcrypt = require('bcrypt');   // the project uses bcrypt, not bcryptjs
const jwt = require('jsonwebtoken');

const {
  User, City, Brand, Vendor, MenuItem, Rider, Order,
} = models;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

// Build the schema once, from the models. (Production uses migrations; tests use
// sync because we want a schema derived from the code under test, and we're
// throwing the database away afterwards either way.)
async function resetDatabase() {
  // ⚠ sync({ force: true }) DROPS EVERY TABLE.
  //
  // If the test process ever picked up the development DB_URL — one bad dotenv
  // ordering away — this line would silently destroy your real data. So refuse to
  // run against anything that isn't obviously a test database.
  const url = process.env.DB_URL || '';
  if (!/test/i.test(url)) {
    throw new Error(
      `Refusing to run tests against "${url.replace(/:[^:@]*@/, ':***@')}".\n` +
      'The database name must contain "test". Set TEST_DB_URL.'
    );
  }

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (err) {
    // Surface the ACTUAL cause. Jest otherwise shows only a generic Sequelize
    // stack, which is what sent us in circles.
    const detail = err.parent?.message || err.original?.message || err.message;
    throw new Error(`resetDatabase failed against ${process.env.DB_URL}: ${detail}`);
  }
}

async function closeDatabase() {
  await sequelize.close();
}

// ─── Factories ────────────────────────────────────────────────────────────────
// Small, explicit, and boring. A test that has to construct five objects before it
// can assert one thing is a test nobody will maintain.

// A monotonic counter — guaranteed unique within a run. The previous version
// sliced a timestamp, so calls in the same millisecond collided. That's what broke
// the full suite while single tests passed: makeUser built near-identical phone
// numbers, and the second insert hit the unique constraint on users.phone.
let counter = 0;
const uniq = () => String(++counter).padStart(8, '0');

async function makeCity(overrides = {}) {
  try {
    return await City.create({
      name: `Harare ${uniq()}`,   // City.name is UNIQUE — can't be a constant
      slug: `harare-${uniq()}`,
      center: { lat: -17.8292, lng: 31.0522 },
      bounds: { north: -17.70, south: -17.95, east: 31.20, west: 30.95 },
      is_active: true,
      ...overrides,
    });
  } catch (err) {
    const detail = err.parent?.message || err.original?.message || err.message;
    const fields = err.errors?.map((e) => `${e.path}: ${e.message}`).join('; ');
    throw new Error(`makeCity failed: ${detail}${fields ? ' | ' + fields : ''}`);
  }
}

async function makeUser(role = 'customer', overrides = {}) {
  const password = await bcrypt.hash('test1234', 10);
  return User.create({
    name: `Test ${role}`,
    phone: `078${uniq().slice(1)}`,   // 078 prefix — can't collide with 077 test data
    password,
    role,
    ...overrides,
  });
}

// A token the API will accept — same shape auth.controller issues.
function tokenFor(user) {
  return jwt.sign(
    { id: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

async function makeVendor(owner, city, overrides = {}) {
  const brand = await Brand.create({
    owner_id: owner.id,
    name: `Brand ${uniq()}`,
    category: 'food',
    is_active: true,
  });

  const branch = await Vendor.create({
    owner_id: owner.id,
    brand_id: brand.id,
    branch_name: `Branch ${uniq()}`,
    city_id: city.id,
    name: brand.name,
    category: 'food',
    phone: '0771234567',
    address: 'Somewhere, Harare',
    location: { lat: -17.83, lng: 31.05 },
    is_active: true,
    is_open: true,
    ...overrides,
  });

  return { brand, branch };
}

async function makeMenuItem(branch, overrides = {}) {
  return MenuItem.create({
    vendor_id: branch.id,
    name: `Item ${uniq()}`,
    price_usd: 5.00,
    weight_kg: 1,
    category: 'Mains',
    is_available: true,
    ...overrides,
  });
}

async function makeRider(user, city, overrides = {}) {
  return Rider.create({
    user_id: user.id,
    city_id: city.id,
    vehicle_type: 'motorbike',
    is_online: true,
    is_approved: true,
    ...overrides,
  });
}

async function makeOrder(customer, city, overrides = {}) {
  return Order.create({
    customer_id: customer.id,
    city: city.slug,
    category_type: 'food',
    pickup_address: 'Pickup, Harare',
    dropoff_address: 'Dropoff, Harare',
    payment_method: 'ecocash',
    status: 'pending',
    subtotal_usd: 10.00,
    delivery_fee_usd: 3.00,
    total_usd: 13.00,
    ...overrides,
  });
}

module.exports = {
  sequelize,
  models,
  resetDatabase,
  closeDatabase,
  makeCity,
  makeUser,
  makeVendor,
  makeMenuItem,
  makeRider,
  makeOrder,
  tokenFor,
};
