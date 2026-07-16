// backend/src/controllers/browse.controller.js
// Customer-facing browsing. Two modes:
//   - Brand-first (food/errands): list brands, each resolved to its nearest branch.
//   - Product-first (materials/grocery): list available products across stores,
//     each carrying its brand + nearest branch + price (Instacart-style).
const { Op } = require('sequelize');
const {
  Brand, Vendor, MenuItem, City,
} = require('../models/associations');
const { withLiveOpen } = require('../utils/vendorHours');
const { logger } = require('../utils/logger');

// Haversine distance in km between two {lat,lng} points.
function distanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return Infinity;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Pick the nearest active branch of a brand within the given city.
// Falls back to any active branch in the city if no coordinates.
function nearestBranch(branches, cityId, custLoc) {
  const inCity = branches.filter((b) => b.is_active && b.city_id === cityId);
  if (!inCity.length) return null;
  if (!custLoc) return inCity[0];
  return inCity
    .map((b) => ({ b, d: distanceKm(custLoc, b.location) }))
    .sort((x, y) => x.d - y.d)[0].b;
}

// GET /api/browse/brands?category=food&city_id=...&lat=&lng=
// Brand-first browsing: one card per brand, resolved to its nearest branch in-city.
async function browseBrands(req, res) {
  try {
    const { category, city_id, lat, lng } = req.query;
    const custLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    const where = { is_active: true };
    if (category) where.category = category;

    const brands = await Brand.findAll({
      where,
      include: [{
        model: Vendor, as: 'branches', required: false,
        include: [{ model: City, as: 'city', required: false }],
      }],
    });

    // For each brand, resolve the nearest in-city branch. Skip brands with no
    // branch in this city.
    const result = [];
    for (const brand of brands) {
      const branches = (brand.branches || []).map((b) => b.toJSON());
      const branch = nearestBranch(branches, city_id, custLoc);
      if (!branch) continue;

      const liveBranch = withLiveOpen(branch);
      result.push({
        // Present the BRAND to the customer, backed by the resolved branch.
        id:          brand.id,
        name:        brand.name,
        category:    brand.category,
        description: brand.description,
        logo_url:    brand.logo_url,
        cover_url:   brand.cover_url,
        rating:      brand.rating,
        // The resolved branch the order will actually route to (mostly hidden).
        branch_id:   branch.id,
        branch_city: liveBranch.city?.name || null,
        is_open:     liveBranch.is_open,
        branch_count: branches.filter((b) => b.is_active && b.city_id === city_id).length,
      });
    }

    return res.status(200).json({ brands: result });
  } catch (err) {
    logger.error('browsebrands_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load brands' });
  }
}

// GET /api/browse/products?category=materials&city_id=...&q=&lat=&lng=
// Product-first browsing: available items across all in-city branches, each
// carrying its brand + resolved branch + price.
async function browseProducts(req, res) {
  try {
    const { category, city_id, q, lat, lng } = req.query;
    const custLoc = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null;

    // Active branches in this city serving this vertical.
    const branchWhere = { is_active: true };
    if (city_id) branchWhere.city_id = city_id;
    if (category) branchWhere.category = category;

    const branches = await Vendor.findAll({
      where: branchWhere,
      include: [
        { model: Brand,    as: 'brand',     required: false },
        { model: City,     as: 'city',      required: false },
        { model: MenuItem, as: 'menuItems', where: { is_available: true }, required: false },
      ],
    });

    // Flatten into a product list, one entry per available item.
    let products = [];
    for (const branch of branches) {
      const bj = branch.toJSON();
      const liveOpen = withLiveOpen(bj).is_open;
      const dist = custLoc ? distanceKm(custLoc, bj.location) : null;
      for (const item of bj.menuItems || []) {
        products.push({
          item_id:      item.id,
          name:         item.name,
          description:  item.description,
          price_usd:    item.price_usd,
          image_url:    item.image_url,
          category:     item.category,      // free-form vendor category (Cement, Steel...)
          prep_minutes: item.prep_minutes,
          // Store/brand context
          brand_id:     bj.brand?.id || null,
          brand_name:   bj.brand?.name || bj.name,
          branch_id:    bj.id,
          branch_city:  bj.city?.name || null,
          is_open:      liveOpen,
          distance_km:  dist != null && isFinite(dist) ? parseFloat(dist.toFixed(1)) : null,
        });
      }
    }

    // Optional text search across product names.
    if (q) {
      const needle = q.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(needle));
    }

    // Sort: cheapest first within nearest — simple, useful default.
    products.sort((a, b) => {
      if (a.distance_km != null && b.distance_km != null && a.distance_km !== b.distance_km) {
        return a.distance_km - b.distance_km;
      }
      return Number(a.price_usd) - Number(b.price_usd);
    });

    // Distinct free-form categories present, for the category chips.
    const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

    return res.status(200).json({ products, categories });
  } catch (err) {
    logger.error('browseproducts_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load products' });
  }
}

module.exports = { browseBrands, browseProducts };
