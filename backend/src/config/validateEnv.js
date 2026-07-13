// backend/src/config/validateEnv.js
//
// Fail fast, at boot, if the app is misconfigured.
//
// The alternative — which is what we had — is an app that starts happily and
// then throws on the first request that happens to need the missing value. In
// production that means a "successful" deploy followed by a silent outage, and
// a confusing stack trace instead of a clear message. JWT_SECRET was exactly
// this: absent, the server booted fine and then 500'd on every login.
//
// Required vs optional is deliberate. Payments and image hosting degrade
// gracefully by design (mock payments, local uploads), so they're WARNINGS in
// production, not fatal — the app is still usable without them.

const REQUIRED = [
  { key: 'DB_URL',     why: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET', why: 'signs auth tokens — no fallback exists, and there must not be one' },
];

// Only meaningful in production.
const REQUIRED_IN_PROD = [
  { key: 'CLIENT_ORIGINS', why: 'CORS + socket allowlist; without it the API is open to any origin' },
  { key: 'APP_URL',        why: 'public backend URL — Paynow webhooks resolve against it' },
  { key: 'CLIENT_URL',     why: 'public frontend URL — Paynow redirects back to it' },
];

// Absent → the feature falls back safely. Worth warning about in production,
// because a live deployment almost certainly wants them.
const OPTIONAL_IN_PROD = [
  { key: 'PAYNOW_INTEGRATION_ID',  why: 'payments run in MOCK mode without it — no real money moves' },
  { key: 'PAYNOW_INTEGRATION_KEY', why: 'payments run in MOCK mode without it' },
  { key: 'CLOUDINARY_CLOUD_NAME',  why: 'uploads fall back to local disk, which is WIPED on every redeploy' },
  { key: 'CLOUDINARY_API_KEY',     why: 'uploads fall back to local disk' },
  { key: 'CLOUDINARY_API_SECRET',  why: 'uploads fall back to local disk' },
];

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const missing = [];
  const warnings = [];

  for (const { key, why } of REQUIRED) {
    if (!process.env[key]) missing.push(`${key} — ${why}`);
  }

  if (isProd) {
    for (const { key, why } of REQUIRED_IN_PROD) {
      if (!process.env[key]) missing.push(`${key} — ${why}`);
    }
    for (const { key, why } of OPTIONAL_IN_PROD) {
      if (!process.env[key]) warnings.push(`${key} — ${why}`);
    }

    // A short secret is barely better than no secret.
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      missing.push('JWT_SECRET — too short; use at least 32 random characters');
    }
  }

  if (warnings.length) {
    console.warn('\n⚠️  Running without:');
    warnings.forEach((w) => console.warn(`   • ${w}`));
    console.warn('');
  }

  if (missing.length) {
    console.error('\n❌ FATAL: missing required configuration\n');
    missing.forEach((m) => console.error(`   • ${m}`));
    console.error('\nSet these in the environment (or backend/.env) and restart.\n');
    process.exit(1);
  }

  console.log(`✅ Environment validated (${isProd ? 'production' : 'development'})`);
}

module.exports = { validateEnv };
