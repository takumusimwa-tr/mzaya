const { Vendor, MenuItem, City } = require('../models/associations');

// ─── Register a vendor ────────────────────────────────────────────────────────
async function registerVendor(req, res) {
  try {
    const { name, category, phone, address, location, city_id, description, opening_hours } = req.body;

    if (!name || !category || !phone || !address || !city_id) {
      return res.status(400).json({ error: 'name, category, phone, address and city_id are required' });
    }

    const existing = await Vendor.findOne({ where: { owner_id: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: 'You already have a registered vendor' });
    }

    const vendor = await Vendor.create({
      owner_id: req.user.id,
      city_id,
      name,
      category,
      phone,
      address,
      location:      location || null,
      description:   description || null,
      opening_hours: opening_hours || null,
    });

    return res.status(201).json({
      message: 'Vendor registered — pending admin approval',
      vendor,
    });
  } catch (err) {
    console.error('registerVendor error:', err.message);
    return res.status(500).json({ error: 'Could not register vendor' });
  }
}

// ─── Get vendor profile ───────────────────────────────────────────────────────
async function getVendor(req, res) {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [{ model: MenuItem, as: 'menuItems', where: { is_available: true }, required: false }],
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    return res.status(200).json({ vendor });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── List vendors by city and category ───────────────────────────────────────
async function listVendors(req, res) {
  try {
    const { city_id, category } = req.query;
    const where = { is_active: true, is_open: true };
    if (city_id)   where.city_id  = city_id;
    if (category)  where.category = category;

    const vendors = await Vendor.findAll({ where, limit: 50 });
    return res.status(200).json({ vendors });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Update vendor (owner only) ───────────────────────────────────────────────
async function updateVendor(req, res) {
  try {
    const vendor = await Vendor.findOne({ where: { id: req.params.id, owner_id: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found or access denied' });

    const allowed = ['name', 'phone', 'address', 'location', 'description', 'opening_hours', 'is_open', 'logo_url'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    await vendor.update(updates);
    return res.status(200).json({ message: 'Vendor updated', vendor });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Add menu item ────────────────────────────────────────────────────────────
async function addMenuItem(req, res) {
  try {
    const vendor = await Vendor.findOne({ where: { id: req.params.id, owner_id: req.user.id } });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found or access denied' });

    const { name, description, price_usd, weight_kg, category, image_url } = req.body;
    if (!name || !price_usd) return res.status(400).json({ error: 'name and price_usd are required' });

    const item = await MenuItem.create({
      vendor_id:   vendor.id,
      name,
      description: description || null,
      price_usd,
      weight_kg:   weight_kg || 0,
      category:    category || null,
      image_url:   image_url || null,
    });

    return res.status(201).json({ message: 'Menu item added', item });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Update menu item ─────────────────────────────────────────────────────────
async function updateMenuItem(req, res) {
  try {
    const item = await MenuItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const vendor = await Vendor.findOne({ where: { id: item.vendor_id, owner_id: req.user.id } });
    if (!vendor) return res.status(403).json({ error: 'Access denied' });

    await item.update(req.body);
    return res.status(200).json({ message: 'Item updated', item });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Delete menu item ─────────────────────────────────────────────────────────
async function deleteMenuItem(req, res) {
  try {
    const item = await MenuItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const vendor = await Vendor.findOne({ where: { id: item.vendor_id, owner_id: req.user.id } });
    if (!vendor) return res.status(403).json({ error: 'Access denied' });

    await item.destroy();
    return res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { registerVendor, getVendor, listVendors, updateVendor, addMenuItem, updateMenuItem, deleteMenuItem };