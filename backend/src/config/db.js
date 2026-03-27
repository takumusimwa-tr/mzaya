const { Sequelize } = require('sequelize');

// dotenv is loaded by index.js before this module is required
if (!process.env.DB_URL) {
  console.error('FATAL: DB_URL is not set in .env');
  process.exit(1);
}

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };