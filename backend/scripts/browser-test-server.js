const http = require('node:http');
const { randomBytes } = require('node:crypto');
const { assertIntegrationUrl } = require('../tests/integrationDatabaseGuard');

async function main() {
  if (process.env.BROWSER_TEST_RESET_CONFIRM !== 'RESET_MZAYA_INTEGRATION_TEST') {
    throw new Error('Explicit browser database reset confirmation required');
  }
  assertIntegrationUrl(process.env.TEST_DB_URL);
  // Reserve the port before any destructive operation. No app requests until ready.
  let handler = (_req, res) => { res.writeHead(503); res.end('Starting'); };
  const server = http.createServer((req, res) => handler(req, res));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(5107, '127.0.0.1', resolve);
  });
  // Prevent dotenv from loading any real service credentials in this process.
  const dotenv = require('dotenv');
  dotenv.config = () => ({ parsed: {} });
  Object.assign(process.env, {
    JWT_SECRET: randomBytes(48).toString('hex'), CLIENT_ORIGINS: 'http://127.0.0.1:5177',
    CLIENT_URL: 'http://127.0.0.1:5177', APP_URL: 'http://127.0.0.1:5107',
    REDIS_URL: '', ECOCASH_API_KEY: '', CLOUDINARY_CLOUD_NAME: '', CLOUDINARY_API_KEY: '', CLOUDINARY_API_SECRET: '',
    MEDIA_STORAGE_DRIVER: 'local', MEDIA_BUCKET: '', ML_SERVICE_URL: 'http://127.0.0.1:1',
    NOTIFICATION_EMAIL_MODE: 'disabled', NOTIFICATION_SMS_MODE: 'disabled', NOTIFICATION_PUSH_MODE: 'disabled',
    CHAT_PUSH_MODE: 'disabled', SETTLEMENT_PAYOUT_MODE: 'disabled', TREASURY_TRANSFER_MODE: 'disabled',
    FINANCE_FAILURE_INJECTION: '', FINANCE_FAILURE_POINT: '', PORT: '5107',
  });
  require('../tests/env');
  const { resetDatabase, closeDatabase } = require('../tests/setup');
  const { seedBrowserFixtures } = require('../tests/browserFixtures');
  const app = require('../src/app');
  const { initSocket, closeSocket } = require('../src/realtime/socket');
  await resetDatabase();
  const fixtures = await seedBrowserFixtures();
  // Block media routes until isolated classic image storage is implemented.
  handler = (req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1:5107').pathname;
    if (pathname === '/__browser/fixtures') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      return res.end(JSON.stringify(fixtures));
    }
    if (/^\/(?:uploads|api\/(?:uploads|attachments))(?:\/|$)/i.test(pathname)) {
      res.writeHead(403); return res.end('Media disabled in browser smoke environment');
    }
    return app(req, res);
  };
  initSocket(server);
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    await closeSocket();
    await closeDatabase();
    process.exit(0);
  }
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  console.log('Browser API ready on 127.0.0.1:5107');
}
main().catch(() => { console.error('Browser API startup failed. Check explicit test URL, reset confirmation, port and fixtures.'); process.exit(1); });
