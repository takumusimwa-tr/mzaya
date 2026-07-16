module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],

  // Runs BEFORE each test module is evaluated — critically before the test file's
  // own `require('../src/app')` on line 2. app.js bakes its config (mock payments,
  // DB connection) at load time, so the environment MUST be correct by then.
  // setup.js was too late; the test files import app before they import setup.
  setupFiles: ['<rootDir>/tests/env.js'],

  // Close the shared DB connection ONCE, after all files finish. Per-file
  // afterAll(closeDatabase) closed it after the first file, breaking every file
  // after it (they share one connection under --runInBand).
  globalTeardown: '<rootDir>/tests/teardown.js',

  // Integration tests hit a real database, so they're slower than unit tests and
  // they must not run in parallel — they'd fight over the same tables.
  maxWorkers: 1,
  testTimeout: 20000,

  // A test that leaves a handle open (a socket, a pool) hangs CI. Fail loudly
  // rather than waiting forever.
  forceExit: true,
  detectOpenHandles: false,

  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    'src/middleware/**/*.js',
  ],
};
