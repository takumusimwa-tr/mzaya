const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const http    = require('http');
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const { initSocket } = require('./realtime/socket');

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
app.use(cors());
// helmet with crossOriginResourcePolicy disabled so uploaded images load cross-origin (frontend on :5173)
app.use(helmet({ crossOriginResourcePolicy: false }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth',      authRoutes);
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

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

async function boot() {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Models synced');

  startCurrencySyncJob();
  startScheduledReleaseJob();

  const PORT = process.env.PORT || 5000;
  const server = http.createServer(app);
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`ML service expected at ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  });
}

boot();
