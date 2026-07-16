// backend/tests/teardown.js
//
// Runs ONCE, after the entire test run. Closes the shared DB connection.
//
// globalTeardown runs in a FRESH context — Jest's setupFiles (env.js) has NOT run
// here — so we must set up the environment ourselves before requiring config/db,
// which fatally exits if DB_URL is unset.
require('./env');

module.exports = async () => {
  try {
    const { sequelize } = require('../src/config/db');
    await sequelize.close();
  } catch {
    // Already closed or never opened — fine.
  }
};
