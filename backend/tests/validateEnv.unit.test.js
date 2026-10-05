describe('deployed environment validation', () => {
  const original = { ...process.env };
  const exit = process.exit;
  const log = console.log;
  const error = console.error;

  beforeEach(() => {
    jest.resetModules();
    process.exit = jest.fn((code) => { throw new Error(`EXIT:${code}`); });
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    process.env = { ...original };
    process.exit = exit;
    console.log = log;
    console.error = error;
  });

  test('staging requires shared network/security configuration but permits mock payments', () => {
    Object.assign(process.env, {
      NODE_ENV: 'staging',
      DB_URL: 'postgresql://example.invalid/mzaya',
      JWT_SECRET: 'x'.repeat(40),
      CLIENT_ORIGINS: 'https://staging.example.com',
      APP_URL: 'https://api-staging.example.com',
      CLIENT_URL: 'https://staging.example.com',
      REDIS_URL: 'redis://example.invalid:6379',
      ALLOW_MOCK_PAYMENTS: 'true',
    });
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).not.toThrow();
  });

  test('production rejects simulated payments', () => {
    Object.assign(process.env, {
      NODE_ENV: 'production',
      DB_URL: 'postgresql://example.invalid/mzaya',
      JWT_SECRET: 'x'.repeat(40),
      CLIENT_ORIGINS: 'https://mzaya.co.zw',
      APP_URL: 'https://api.mzaya.co.zw',
      CLIENT_URL: 'https://mzaya.co.zw',
      REDIS_URL: 'redis://example.invalid:6379',
      PAYNOW_INTEGRATION_ID: 'id',
      PAYNOW_INTEGRATION_KEY: 'key',
      CLOUDINARY_CLOUD_NAME: 'cloud',
      CLOUDINARY_API_KEY: 'key',
      CLOUDINARY_API_SECRET: 'secret',
      ALLOW_MOCK_PAYMENTS: 'true',
    });
    const { validateEnv } = require('../src/config/validateEnv');
    expect(() => validateEnv()).toThrow('EXIT:1');
  });
});
