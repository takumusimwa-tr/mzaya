// Fail fast when a deployed API is missing configuration that protects money,
// credentials, uploads or network boundaries.
const { name, isProduction, isDeployed } = require('./runtimeEnv');

const REQUIRED = [
  { key: 'DB_URL', why: 'PostgreSQL connection string' },
  { key: 'JWT_SECRET', why: 'signs auth tokens — no fallback exists' },
];

const REQUIRED_WHEN_DEPLOYED = [
  { key: 'CLIENT_ORIGINS', why: 'CORS + socket allowlist for an internet-facing API' },
  { key: 'APP_URL', why: 'public backend URL used by provider callbacks' },
  { key: 'CLIENT_URL', why: 'public frontend URL used by provider redirects' },
  { key: 'REDIS_URL', why: 'shared rate-limit state; per-process limits are unsafe when deployed' },
];

const REQUIRED_IN_PRODUCTION = [
  { key: 'PAYNOW_INTEGRATION_ID', why: 'without it payments would be simulated' },
  { key: 'PAYNOW_INTEGRATION_KEY', why: 'without it payments would be simulated' },
  { key: 'CLOUDINARY_CLOUD_NAME', why: 'without it uploads can land on ephemeral disk' },
  { key: 'CLOUDINARY_API_KEY', why: 'without it uploads can land on ephemeral disk' },
  { key: 'CLOUDINARY_API_SECRET', why: 'without it uploads can land on ephemeral disk' },
];

function validateEnv() {
  const missing = [];

  for (const { key, why } of REQUIRED) {
    if (!process.env[key]) missing.push(`${key} — ${why}`);
  }

  if (isDeployed) {
    for (const { key, why } of REQUIRED_WHEN_DEPLOYED) {
      if (!process.env[key]) missing.push(`${key} — ${why}`);
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      missing.push('JWT_SECRET — too short; use at least 32 random characters');
    }
  }

  if (isProduction) {
    for (const { key, why } of REQUIRED_IN_PRODUCTION) {
      if (!process.env[key]) missing.push(`${key} — ${why}`);
    }
    if (process.env.ALLOW_MOCK_PAYMENTS === 'true') {
      missing.push('ALLOW_MOCK_PAYMENTS — must never be true in production');
    }
  }

  if (missing.length) {
    console.error(`\n❌ FATAL: invalid ${name} configuration\n`);
    missing.forEach((item) => console.error(`   • ${item}`));
    console.error('\nSet these environment variables and restart.\n');
    process.exit(1);
  }

  console.log(`✅ Environment validated (${name})`);
}

module.exports = { validateEnv };
