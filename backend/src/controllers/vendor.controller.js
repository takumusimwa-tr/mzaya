const { Vendor, MenuItem, City } = require('../models/associations');
const { withLiveOpen } = require('../utils/vendorHours');

// GET /api/vendors
async function listVendors(req, res) {
  try {
    const { category, city_id, is_open } = req.query;
    const where = { is_active: true };
    if (category) where.category = category;
    if (city_id)  where.city_id  = city_id;

    const rows = await Vendor.findAll({
      where,
      include: [
        { model: MenuItem, as: 'menuItems', where: { is_available: true }, required: false },
        { model: City,     as: 'city',      required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Compute live open/closed from hours + pause for each vendor.
    let vendors = rows.map((v) => withLiveOpen(v.toJSON()));

    // If the caller asked to filter by open status, apply it after computing.
    if (is_open !== undefined) {
      const want = is_open === 'true';
      vendors = vendors.filter((v) => v.is_open === want);
    }

    return res.status(200).json({ vendors });
  } catch (err) {
    console.error('listVendors error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch vendors' });
  }
}

// GET /api/vendors/my
async function getMyVendor(req, res) {
  try {
    const vendor = await Vendor.findOne({
      where: { owner_id: req.user.id },
      include: [{ model: MenuItem, as: 'menuItems', required: false }],
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    return res.status(200).json({ vendor: withLiveOpen(vendor.toJSON()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
}

// GET /api/vendors/:id
async function getVendor(req, res) {
  try {
    const vendor = await Vendor.findByPk(req.params.id, {
      include: [
        { model: MenuItem, as: 'menuItems', where: { is_available: true }, required: false },
        { model: City,     as: 'city',      required: false },
      ],
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    return res.status(200).json({ vendor: withLiveOpen(vendor.toJSON()) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch vendor' });
  }
}

// POST /api/vendors
async function createVendor(req, res) {
  try {
    const { name, category, phone, address, city_id, description } = req.body;
    const vendor = await Vendor.create({
      owner_id: req.user.id,
      name, category, phone, address, city_id, description,
      is_active: false,
      is_open:   false,
    });
    return res.status(201).json({ message: 'Vendor registered — pending approval', vendor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to register vendor' });
  }
}

// PUT /api/vendors/:id
async function updateVendor(req, res) {
  try {
    const vendor = await Vendor.findByPk(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    if (vendor.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only allow safe, owner-editable fields (never owner_id, rating, totals).
    const ALLOWED = [
      'name', 'description', 'category', 'phone', 'address', 'city_id',
      'location', 'opening_hours', 'is_paused', 'is_active', 'logo_url', 'cover_url',
    ];
    const patch = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }

    await vendor.update(patch);
    return res.status(200).json({ vendor: withLiveOpen(vendor.toJSON()) });
  } catch (err) {
    console.error('updateVendor error:', err.message);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
}

// POST /api/vendors/:id/menu
async function addMenuItem(req, res) {
  try {
    const { name, description, price_usd, category, prep_minutes, weight_kg, image_url } = req.body;
    const item = await MenuItem.create({
      vendor_id:    req.params.id,
      name, description, price_usd, category,
      prep_minutes: prep_minutes || 0,
      weight_kg:    weight_kg || 0,
      image_url:    image_url || null,
      is_available: true,
    });
    return res.status(201).json({ item });
  } catch (err) {
    console.error('addMenuItem error:', err.message);
    return res.status(500).json({ error: 'Failed to add menu item' });
  }
}

// PUT /api/vendors/:id/menu/:itemId
async function updateMenuItem(req, res) {
  try {
    const item = await MenuItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.update(req.body);
    return res.status(200).json({ item });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
}

// DELETE /api/vendors/:id/menu/:itemId
async function deleteMenuItem(req, res) {
  try {
    const item = await MenuItem.findByPk(req.params.itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    await item.destroy();
    return res.status(200).json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
}

module.exports = {
  listVendors, getMyVendor, getVendor,
  createVendor, updateVendor,
  addMenuItem, updateMenuItem, deleteMenuItem,
};
