const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env');

// Load .env FIRST, before anything else
require('dotenv').config({ path: envPath });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, sequelize } = require('./config/db');
const User = require('./models/userModel');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

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