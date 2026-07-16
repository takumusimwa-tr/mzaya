const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');
const { logger } = require('../utils/logger');

// Favourites are on BRANDS, not branches.
//
// A customer favourites "Chicken Inn" — not "the CBD branch of Chicken Inn".
// The nearest branch is resolved when they open it, exactly as on the home page.
// (Before the brand→branch restructure these pointed at vendors(id), which meant
// the home page's brand id hit a vendor foreign key and every toggle 500'd.)

// GET /api/favorites — the customer's saved brands.
async function listFavorites(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT b.id,
              b.name,
              b.category,
              b.description,
              b.logo_url,
              b.cover_url,
              b.rating,
              f."createdAt" AS favorited_at,
              (SELECT COUNT(*) FROM vendors v
                WHERE v.brand_id = b.id AND v.is_active = true) AS branch_count,
              -- A branch to open when the customer taps through. The home page
              -- resolves the NEAREST branch by distance; here we have no
              -- coordinates, so hand back an active branch and let the vendor
              -- page take it from there.
              (SELECT v.id FROM vendors v
                WHERE v.brand_id = b.id AND v.is_active = true
                ORDER BY v."createdAt" ASC LIMIT 1) AS branch_id
         FROM favorites f
         JOIN brands b ON b.id = f.brand_id
        WHERE f.customer_id = :uid
          AND b.is_active = true
        ORDER BY f."createdAt" DESC`,
      { replacements: { uid: req.user.id }, type: QueryTypes.SELECT }
    );
    return res.status(200).json({ brands: rows });
  } catch (err) {
    logger.error('listfavorites_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
}

// GET /api/favorites/ids — brand ids only (drives the heart state on the home page).
async function favoriteIds(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT brand_id FROM favorites WHERE customer_id = :uid`,
      { replacements: { uid: req.user.id }, type: QueryTypes.SELECT }
    );
    return res.status(200).json({ ids: rows.map((r) => r.brand_id) });
  } catch (err) {
    logger.error('favoriteids_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch favorite ids' });
  }
}

// POST /api/favorites/:brandId — toggle a brand favourite on/off.
async function toggleFavorite(req, res) {
  try {
    // The route param is still named :vendorId for URL compatibility, but it is
    // a BRAND id. Accept either param name so nothing breaks mid-deploy.
    const brandId = req.params.brandId || req.params.vendorId;
    if (!brandId) return res.status(400).json({ error: 'brand id is required' });

    // Verify the brand exists — a clear 404 beats a foreign-key 500.
    const brand = await sequelize.query(
      `SELECT id FROM brands WHERE id = :bid`,
      { replacements: { bid: brandId }, type: QueryTypes.SELECT }
    );
    if (brand.length === 0) return res.status(404).json({ error: 'Brand not found' });

    const existing = await sequelize.query(
      `SELECT id FROM favorites WHERE customer_id = :uid AND brand_id = :bid`,
      { replacements: { uid: req.user.id, bid: brandId }, type: QueryTypes.SELECT }
    );

    if (existing.length > 0) {
      await sequelize.query(
        `DELETE FROM favorites WHERE customer_id = :uid AND brand_id = :bid`,
        { replacements: { uid: req.user.id, bid: brandId }, type: QueryTypes.DELETE }
      );
      return res.status(200).json({ favorited: false });
    }

    await sequelize.query(
      `INSERT INTO favorites (id, customer_id, brand_id, "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :uid, :bid, NOW(), NOW())
       ON CONFLICT (customer_id, brand_id) DO NOTHING`,
      { replacements: { uid: req.user.id, bid: brandId }, type: QueryTypes.INSERT }
    );
    return res.status(201).json({ favorited: true });
  } catch (err) {
    logger.error('togglefavorite_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to toggle favorite' });
  }
}

module.exports = { listFavorites, favoriteIds, toggleFavorite };
