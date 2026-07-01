const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

// GET /api/favorites — list the customer's saved vendors (with vendor details)
async function listFavorites(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT v.*, f."createdAt" AS favorited_at
       FROM favorites f
       JOIN vendors v ON v.id = f.vendor_id
       WHERE f.customer_id = :uid
       ORDER BY f."createdAt" DESC`,
      { replacements: { uid: req.user.id }, type: QueryTypes.SELECT }
    );
    return res.status(200).json({ vendors: rows });
  } catch (err) {
    console.error('listFavorites error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

// GET /api/favorites/ids — just the vendor IDs (for heart state on home/vendor pages)
async function favoriteIds(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT vendor_id FROM favorites WHERE customer_id = :uid`,
      { replacements: { uid: req.user.id }, type: QueryTypes.SELECT }
    );
    return res.status(200).json({ ids: rows.map((r) => r.vendor_id) });
  } catch (err) {
    console.error('favoriteIds error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch favorite ids' });
  }
}

// POST /api/favorites/:vendorId — toggle a favorite on/off
async function toggleFavorite(req, res) {
  try {
    const { vendorId } = req.params;

    const existing = await sequelize.query(
      `SELECT id FROM favorites WHERE customer_id = :uid AND vendor_id = :vid`,
      { replacements: { uid: req.user.id, vid: vendorId }, type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      await sequelize.query(
        `DELETE FROM favorites WHERE customer_id = :uid AND vendor_id = :vid`,
        { replacements: { uid: req.user.id, vid: vendorId }, type: QueryTypes.DELETE }
      );
      return res.status(200).json({ favorited: false });
    }

    await sequelize.query(
      `INSERT INTO favorites (id, customer_id, vendor_id, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :uid, :vid, NOW(), NOW())`,
      { replacements: { uid: req.user.id, vid: vendorId }, type: QueryTypes.INSERT }
    );
    return res.status(201).json({ favorited: true });
  } catch (err) {
    console.error('toggleFavorite error:', err.message);
    return res.status(500).json({ error: 'Failed to toggle favorite' });
  }
}

module.exports = { listFavorites, favoriteIds, toggleFavorite };
