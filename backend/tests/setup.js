// backend/tests/setup.js
//
// Test factories and lifecycle.
//
// The ENVIRONMENT bootstrap (NODE_ENV, mock payments, SSL, and test DB URL)
// lives in env.js, which Jest runs via setupFiles BEFORE this file or any test
// module loads.
//
// That ordering matters because test files may require app.js before requiring
// this module. app.js transitively loads services and config/db.js, both of
// which read environment variables at module-load time.
//
// By the time anything here runs, tests/env.js must already have established
// the isolated test environment.

const { sequelize } = require('../src/config/db');
const models = require('../src/models/associations');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  User,
  City,
  Brand,
  Vendor,
  MenuItem,
  Rider,
  Order,
} = models;

// ─── Lifecycle ────────────────────────────────────────────────────────────────

/**
 * Return a safe identifier for the configured database.
 *
 * Never return the raw connection string because it may contain credentials.
 */
function getSafeDatabaseTarget() {
  try {
    const parsed = new URL(process.env.DB_URL || '');
    const databaseName = parsed.pathname.replace(/^\//, '');

    return `${parsed.hostname}/${databaseName}`;
  } catch {
    return 'configured test database';
  }
}

/**
 * Verify that destructive test setup is targeting an explicitly test-named
 * database.
 *
 * resetDatabase() calls sequelize.sync({ force: true }), which DROPS every
 * table managed by Sequelize. This guard is intentionally independent from the
 * corresponding guard in tests/env.js so that one accidental configuration
 * regression cannot silently expose staging or production data.
 */
function assertSafeTestDatabase() {
  const rawUrl = process.env.DB_URL || '';

  if (!rawUrl) {
    throw new Error(
      'Refusing to reset database because DB_URL is not configured.'
    );
  }

  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(
      'Refusing to reset database because DB_URL is not a valid connection URL.'
    );
  }

  const databaseName = parsed.pathname.replace(/^\//, '');

  if (!/test/i.test(databaseName)) {
    throw new Error(
      `Refusing to run destructive tests against non-test database ` +
      `"${parsed.hostname}/${databaseName}". ` +
      'The database name must contain "test". Set TEST_DB_URL.'
    );
  }

  if (process.env.NODE_ENV !== 'test') {
    throw new Error(
      `Refusing to reset the test database while NODE_ENV=` +
      `"${process.env.NODE_ENV || 'unset'}". NODE_ENV must be "test".`
    );
  }
}

// Build the schema from the models.
//
// Production and staging use migrations. Tests intentionally use
// sync({ force: true }) because the test database is disposable and we want
// each test group to start from a schema derived from the code under test.
//
// WARNING:
// sequelize.sync({ force: true }) DROPS TABLES. Never weaken the safety checks
// above without replacing them with an equivalent or stronger isolation
// mechanism.
async function resetDatabase() {
  assertSafeTestDatabase();

  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });
  } catch (err) {
    // Surface the useful database error while NEVER including DB_URL itself.
    //
    // DB_URL can contain a username and password, and including it here caused
    // credentials to appear in Jest output during an earlier failed test run.
    const detail =
      err.parent?.message ||
      err.original?.message ||
      err.message ||
      'Unknown database error';

    throw new Error(
      `resetDatabase failed against ${getSafeDatabaseTarget()}: ${detail}`
    );
  }
}

async function closeDatabase() {
  await sequelize.close();
}

// ─── Factories ────────────────────────────────────────────────────────────────
//
// Keep factories small and explicit. Tests should be able to construct the
// minimum state they need without depending on unrelated application flows.

// Monotonic counter guaranteed to be unique within the current Jest process.
//
// The previous timestamp-based implementation could collide when factories
// executed during the same millisecond, producing unique-constraint failures.
let counter = 0;

const uniq = () => String(++counter).padStart(8, '0');

async function makeCity(overrides = {}) {
  try {
    return await City.create({
      // City.name is UNIQUE, so generated test cities cannot use a constant.
      name: `Harare ${uniq()}`,
      slug: `harare-${uniq()}`,
      center: {
        lat: -17.8292,
        lng: 31.0522,
      },
      bounds: {
        north: -17.70,
        south: -17.95,
        east: 31.20,
        west: 30.95,
      },
      is_active: true,
      ...overrides,
    });
  } catch (err) {
    const detail =
      err.parent?.message ||
      err.original?.message ||
      err.message;

    const fields = err.errors
      ?.map((error) => `${error.path}: ${error.message}`)
      .join('; ');

    throw new Error(
      `makeCity failed: ${detail}${fields ? ` | ${fields}` : ''}`
    );
  }
}

async function makeUser(role = 'customer', overrides = {}) {
  const password = await bcrypt.hash('test1234', 10);

  return User.create({
    name: `Test ${role}`,

    // 078 prefix keeps generated factory numbers separate from static 077 test
    // fixtures while uniq() prevents collisions inside the current test run.
    phone: `078${uniq().slice(1)}`,

    password,
    role,
    ...overrides,
  });
}

// Generate a token matching the shape issued by auth.controller.
function tokenFor(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      phone: user.phone,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
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
    location: {
      lat: -17.83,
      lng: 31.05,
    },
    is_active: true,
    is_open: true,
    ...overrides,
  });

  return {
    brand,
    branch,
  };
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