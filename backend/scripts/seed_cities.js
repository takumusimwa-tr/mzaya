// backend/scripts/seed_cities.js
//
// Seed the default Zimbabwean cities directly (same data as the admin
// POST /api/cities/seed endpoint, but runnable from the command line so you don't
// need to juggle an admin token). The catalogue seed depends on "harare" existing.
//
//   node scripts/seed_cities.js
//
// Reads DB_URL from .env — point it at whichever database you want to seed.
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { sequelize } = require('../src/config/db');
const { City } = require('../src/models/associations');

const CITIES = [
  {
    name:   'Harare',
    slug:   'harare',
    center: { lat: -17.8252, lng: 31.0335 },
    bounds: { north: -17.6, south: -18.0, east: 31.3, west: 30.8 },
    is_active: true,
  },
  {
    name:   'Bulawayo',
    slug:   'bulawayo',
    center: { lat: -20.1325, lng: 28.6261 },
    bounds: { north: -19.9, south: -20.4, east: 28.9, west: 28.3 },
    is_active: true,
  },
  {
    name:   'Mutare',
    slug:   'mutare',
    center: { lat: -18.9707, lng: 32.6709 },
    bounds: { north: -18.8, south: -19.1, east: 32.9, west: 32.4 },
    is_active: true,
  },
];

async function run() {
  await sequelize.authenticate();
  console.log('Connected.\n');

  for (const city of CITIES) {
    const [row, created] = await City.findOrCreate({
      where: { slug: city.slug },
      defaults: city,
    });
    console.log(`${created ? '+ created' : '· exists '} ${row.name}`);
  }

  console.log('\nCities seeded.');
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
