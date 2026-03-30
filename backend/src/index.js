const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { connectDB, sequelize }       = require('./config/db');
const { startCurrencySyncJob }       = require('./jobs/currencySync.job');

require('./models/associations');

const authRoutes      = require('./routes/auth.routes');
const orderRoutes     = require('./routes/order.routes');
const vendorRoutes    = require('./routes/vendor.routes');
const riderRoutes     = require('./routes/rider.routes');
const cityRoutes      = require('./routes/city.routes');
const paymentRoutes   = require('./routes/payment.routes');
const analyticsRoutes = require('./routes/analytics.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth',      authRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/vendors',   vendorRoutes);
app.use('/api/riders',    riderRoutes);
app.use('/api/cities',    cityRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Mzaya API running',
    version:   '1.0.0',
    endpoints: [
      '/api/auth', '/api/orders', '/api/vendors',
      '/api/riders', '/api/cities', '/api/payments',
      '/api/analytics',
    ],
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

async function boot() {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Models synced');

  startCurrencySyncJob();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`ML service expected at ${process.env.ML_SERVICE_URL || 'http://localhost:8000'}`);
  });
}

boot();