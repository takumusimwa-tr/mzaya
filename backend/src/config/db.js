const { Sequelize } = require('sequelize');

// dotenv is loaded by index.js before this module is required
if (!process.env.DB_URL) {
  console.error('FATAL: DB_URL is not set in .env');
  process.exit(1);
}

// Managed Postgres providers (Render, Railway, Supabase, Neon, Heroku) require
// SSL, and most present a certificate that isn't in Node's default trust store —
// hence rejectUnauthorized: false. Local Postgres doesn't use SSL, so we only
// enable it in production (or when DB_SSL=true is set explicitly).
const useSSL = process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  logging: false,
  ...(useSSL && {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }),
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
    console.log(`Database connected successfully${useSSL ? ' (SSL)' : ''}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
