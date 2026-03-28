const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, sequelize } = require('./config/db');

// Load all models + associations in one shot
require('./models/associations');

const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Mzaya API running' });
});

async function boot() {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('Models synced');

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

boot();