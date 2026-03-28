const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, sequelize } = require('./config/db');
const { startCurrencySyncJob } = require('./jobs/currencySync.job');

// Load all models + associations
require('./models/associations');

// Routes
const authRoutes  = require('./routes/auth.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth',   authRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mzaya API running' });
});

// Global error handler
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
  });
}

boot();