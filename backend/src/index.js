const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

// Validate configuration before anything else reads it. A misconfigured app
// should fail loudly at boot, not silently at 2am on the first request that
// happens to need the missing value.
const { validateEnv } = require('./config/validateEnv');
validateEnv();

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const { initSocket } = require('./realtime/socket');
const { logger, requestLogger } = require('./utils/logger');
const { authLimiter, writeLimiter, apiLimiter } = require('./middleware/rateLimit.middleware');

const { connectDB, sequelize }       = require('./config/db');
const { startCurrencySyncJob }       = require('./jobs/currencySync.job');
const { startScheduledReleaseJob }   = require('./jobs/scheduledRelease.job');

require('./models/associations');

const authRoutes      = require('./routes/auth.routes');
const orderRoutes     = require('./routes/order.routes');
const vendorRoutes    = require('./routes/vendor.routes');
const riderRoutes     = require('./routes/rider.routes');
const cityRoutes      = require('./routes/city.routes');
const paymentRoutes   = require('./routes/payment.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const uploadRoutes    = require('./routes/upload.routes');
const favoriteRoutes  = require('./routes/favorite.routes');
const addressRoutes   = require('./routes/address.routes');
const vehicleRoutes   = require('./routes/vehicle.routes');
const geoRoutes       = require('./routes/geo.routes');
const promoRoutes     = require('./routes/promo.routes');
const vendorStatsRoutes = require('./routes/vendorStats.routes');
const adminRoutes     = require('./routes/admin.routes');
const browseRoutes    = require('./routes/browse.routes');
const negotiationRoutes = require('./routes/negotiation.routes');
const chatRoutes      = require('./routes/chat.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Paynow webhooks are form-encoded
// CORS. In development we allow anything (convenient). In production we allow
// only the origins listed in CLIENT_ORIGINS — an open CORS policy on a live API
// lets any site make authenticated requests on your users' behalf.
const allowedOrigins = (process.env.CLIENT_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors(
  process.env.NODE_ENV === 'production' && allowedOrigins.length
    ? { origin: allowedOrigins, credentials: true }
    : {}
));
// helmet with crossOriginResourcePolicy disabled so uploaded images load cross-origin (frontend on :5173)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Trust the proxy in production (Render/Railway/Cloudflare sit in front of us).
// Without this, express-rate-limit sees every request as coming from the proxy's
// IP and would throttle all users as if they were one person.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// One structured log line per request.
app.use(requestLogger);

// Rate limiting. Without it, the login endpoint is brute-forceable at network
// speed. Tightest budget on credentials, moderate on writes, generous on reads.
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth',      authRoutes);
// Writes get a tighter budget than reads — order spam, offer spam, message spam.
app.use('/api/orders',    writeLimiter);
app.use('/api/uploads',   writeLimiter);
app.use('/api/orders',    negotiationRoutes);
app.use('/api/orders',    chatRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/vendors',   vendorRoutes);
app.use('/api/riders',    riderRoutes);
app.use('/api/cities',    cityRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads',   uploadRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/vehicles',  vehicleRoutes);
app.use('/api/geo',       geoRoutes);
app.use('/api/promos',    promoRoutes);
app.use('/api/vendor-stats', vendorStatsRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/browse',    browseRoutes);

// ─── Health checks ────────────────────────────────────────────────────────────
// Hosting platforms poll these to decide whether an instance is alive and
// whether it's safe to route traffic to it. Without them a deploy either has no
// health gate at all, or the platform marks a perfectly healthy box as failed.
//
//   /health — is the process up? (liveness — must be cheap, no dependencies)
//   /ready  — can it actually serve? (readiness — checks the database)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.get('/ready', async (req, res) => {
  try {
    await sequelize.authenticate();
    return res.status(200).json({ status: 'ready', db: 'up' });
  } catch (err) {
    // Not ready — the platform should hold traffic back rather than send it here.
    return res.status(503).json({ status: 'not_ready', db: 'down' });
  }
});

app.get('/', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Mzaya API running',
    version:   '1.0.0',
    endpoints: [
      '/api/auth', '/api/orders', '/api/vendors',
      '/api/riders', '/api/cities', '/api/payments',
      '/api/analytics', '/api/uploads', '/api/favorites',
      '/api/addresses', '/api/vehicles', '/api/geo', '/api/promos',
    ],
  });
});

// Unhandled errors. In production we log the detail but return a generic
// message — an error string can leak table names, file paths, and query shapes.
app.use((err, req, res, next) => {
  logger.error('unhandled_error', {
    message: err.message,
    stack:   err.stack,
    path:    req.originalUrl,
    method:  req.method,
  });
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: isProd ? 'Internal server error' : (err.message || 'Internal server error'),
  });
});

async function boot() {
  await connectDB();
  // Schema sync.
  //
  // In development, `alter: true` conveniently adds new columns/tables as the
  // models evolve. In PRODUCTION this is dangerous: it inspects and mutates the
  // live schema on every restart, and on a table with real data it can lock,
  // hang, or drop a column it believes is stale. A routine redeploy would become
  // an unintended migration.
  //
  // So: alter in dev, never in production. Production schema changes go through
  // explicit, reviewed migrations.
  const isProd = process.env.NODE_ENV === 'production';
  await sequelize.sync({ alter: !isProd });
  logger.info('models_synced', { alter: !isProd });

  startCurrencySyncJob();
  startScheduledReleaseJob();

  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    logger.info('server_started', {
      port: PORT,
      env:  process.env.NODE_ENV || 'development',
      ml:   process.env.ML_SERVICE_URL || 'http://localhost:8000',
    });
  });
}

boot();
