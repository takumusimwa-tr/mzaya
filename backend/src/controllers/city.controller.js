const { City } = require('../models/associations');

// ─── List all active cities ───────────────────────────────────────────────────
async function listCities(req, res) {
  try {
    const cities = await City.findAll({ where: { is_active: true } });
    return res.status(200).json({ cities });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Create city (admin only) ─────────────────────────────────────────────────
async function createCity(req, res) {
  try {
    const { name, slug, bounds, center } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug are required' });

    const city = await City.create({ name, slug, bounds, center });
    return res.status(201).json({ message: 'City created', city });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Seed default Zimbabwe cities ─────────────────────────────────────────────
async function seedCities(req, res) {
  try {
    const defaults = [
      {
        name:   'Harare',
        slug:   'harare',
        center: { lat: -17.8252, lng: 31.0335 },
        bounds: { north: -17.6, south: -18.0, east: 31.3, west: 30.8 },
      },
      {
        name:   'Bulawayo',
        slug:   'bulawayo',
        center: { lat: -20.1325, lng: 28.6261 },
        bounds: { north: -19.9, south: -20.4, east: 28.9, west: 28.3 },
      },
      {
        name:   'Mutare',
        slug:   'mutare',
        center: { lat: -18.9707, lng: 32.6709 },
        bounds: { north: -18.8, south: -19.1, east: 32.9, west: 32.4 },
      },
    ];

    for (const city of defaults) {
      await City.findOrCreate({ where: { slug: city.slug }, defaults: city });
    }

    return res.status(200).json({ message: 'Cities seeded successfully' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { listCities, createCity, seedCities };