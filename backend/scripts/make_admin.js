// backend/scripts/make_admin.js
//
// Promote an existing user to admin, by phone number.
//
//   node scripts/make_admin.js 0771234567
//
// Reads DB_URL from .env (point it at whichever database you want to change).
// Used once on staging to create the first admin, since registration only ever
// creates customers — and seeding the catalogue needs an admin/vendor owner.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { sequelize } = require('../src/config/db');
const { User } = require('../src/models/associations');

async function run() {
  const phone = process.argv[2];
  if (!phone) {
    console.error('Usage: node scripts/make_admin.js <phone>');
    process.exit(1);
  }

  await sequelize.authenticate();

  const user = await User.findOne({ where: { phone } });
  if (!user) {
    console.error(`No user found with phone ${phone}. Register in the app first.`);
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`${user.name} (${phone}) is already an admin.`);
    process.exit(0);
  }

  const was = user.role;
  user.role = 'admin';
  await user.save();

  console.log(`Promoted ${user.name} (${phone}): ${was} -> admin`);
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
