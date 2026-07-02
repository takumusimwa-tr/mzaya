const { Vendor, MenuItem, City } = require('../models/associations');

// GET /api/vendors
async function listVendors(req, res) {
  try {
    const { category, city_id, is_open } = req.query;
    const where = { is_active: true };
    if (category) where.category = category;
    if (city_id)  where.city_id  = city_id;
    if (is_open !== undefined) where.is_open = is_open === 'true';

    const vendors = await Vendor.findAll({
      where,
      include: [
        { model: MenuItem, as: 'menuItems', where: { is_available: true }, required: false },
        { model: City,     as: 'city',      required: false },
      ],
      order: [['createdAt', 'DESC']],
    });
    return res.status(200).json({ vendors });
  } catch (err) {
    console.error(err);
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
    return res.status(200).json({ vendor });
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
    return res.status(200).json({ vendor });
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
    await vendor.update(req.body);
    return res.status(200).json({ vendor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update vendor' });
  }
}

// POST /api/vendors/:id/menu
async function addMenuItem(req, res) {
  try {
    const { name, description, price_usd, category } = req.body;
    const item = await MenuItem.create({
      vendor_id:    req.params.id,
      name, description, price_usd, category,
      is_available: true,
    });
    return res.status(201).json({ item });
  } catch (err) {
    console.error(err);
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
