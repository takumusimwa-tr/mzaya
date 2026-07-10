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
// GET /api/vendors/my/branches — all branches under this owner's brand.
async function myBranches(req, res) {
  try {
    const { Brand } = require('../models/associations');
    const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
    if (!brand) return res.status(200).json({ branches: [] });

    const branches = await Vendor.findAll({
      where: { brand_id: brand.id },
      include: [{ model: City, as: 'city', required: false }],
      order: [['createdAt', 'ASC']],
    });
    return res.status(200).json({
      brand: { id: brand.id, name: brand.name, category: brand.category, logo_url: brand.logo_url },
      branches: branches.map((b) => withLiveOpen(b.toJSON())),
    });
  } catch (err) {
    console.error('myBranches error:', err.message);
    return res.status(500).json({ error: 'Failed to load branches' });
  }
}

// POST /api/vendors/my/branches — add a new branch to the owner's brand.
async function addBranch(req, res) {
  try {
    const { Brand } = require('../models/associations');
    const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
    if (!brand) return res.status(404).json({ error: 'No brand found for this account' });

    const { branch_name, city_id, address, phone } = req.body;
    if (!branch_name || !city_id || !address || !phone) {
      return res.status(400).json({ error: 'branch name, city, address and phone are required' });
    }

    const branch = await Vendor.create({
      owner_id:    req.user.id,
      brand_id:    brand.id,
      branch_name,
      name:        brand.name,        // branch inherits the brand name
      category:    brand.category,
      phone,
      address,
      city_id,
      description: brand.description,
      logo_url:    brand.logo_url,
      is_active:   false,             // new branches need approval too
      is_open:     false,
    });
    return res.status(201).json({ message: 'Branch added — pending approval', branch });
  } catch (err) {
    console.error('addBranch error:', err.message);
    return res.status(500).json({ error: 'Failed to add branch' });
  }
}

async function getMyVendor(req, res) {
  try {
    // Optional ?branch_id — the console can target a specific branch. Falls back
    // to the owner's first branch (backward compatible for single-branch owners).
    const { branch_id } = req.query;
    const where = { owner_id: req.user.id };
    if (branch_id) where.id = branch_id;

    const vendor = await Vendor.findOne({
      where,
      include: [{ model: MenuItem, as: 'menuItems', required: false }],
      order: [['createdAt', 'ASC']],
    });
    if (!vendor) return res.status(404).json({ error: 'Vendor profile not found' });
    return res.status(200).json({ vendor: withLiveOpen(vendor.toJSON()) });
  } catch (err) {
    console.error('getMyVendor error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch vendor profile' });
  }
}

// GET /api/vendors/my/branches — all branches the owner manages (for the switcher).
async function myBranches(req, res) {
  try {
    const { City } = require('../models/associations');
    const branches = await Vendor.findAll({
      where: { owner_id: req.user.id },
      include: [{ model: City, as: 'city', required: false }],
      order: [['createdAt', 'ASC']],
    });
    return res.status(200).json({
      branches: branches.map((b) => {
        const j = withLiveOpen(b.toJSON());
        return {
          id: j.id, branch_name: j.branch_name, name: j.name,
          city: j.city?.name || null, address: j.address,
          is_active: j.is_active, is_open: j.is_open,
        };
      }),
    });
  } catch (err) {
    console.error('myBranches error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch branches' });
  }
}

// POST /api/vendors/my/branches — add a new branch to the owner's brand.
async function addBranch(req, res) {
  try {
    const { Brand } = require('../models/associations');
    const brand = await Brand.findOne({ where: { owner_id: req.user.id } });
    if (!brand) return res.status(404).json({ error: 'No brand found — register a business first' });

    const { branch_name, city_id, address, phone } = req.body;
    if (!city_id || !address || !phone) {
      return res.status(400).json({ error: 'city, address and phone are required' });
    }

    const branch = await Vendor.create({
      owner_id:    req.user.id,
      brand_id:    brand.id,
      branch_name: branch_name || 'Branch',
      name:        brand.name,          // inherit brand identity
      category:    brand.category,
      description: brand.description,
      logo_url:    brand.logo_url,
      cover_url:   brand.cover_url,
      phone, address, city_id,
      is_active:   false,               // new branches also need approval
      is_open:     false,
    });
    return res.status(201).json({ message: 'Branch added — pending approval', branch });
  } catch (err) {
    console.error('addBranch error:', err.message);
    return res.status(500).json({ error: 'Failed to add branch' });
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

// POST /api/vendors  — vendor self-onboarding.
// Creates a Brand + its first Branch, and promotes the user to the vendor role.
// Everything starts inactive (pending admin approval).
async function createVendor(req, res) {
  const { sequelize } = require('../config/db');
  const { User, Brand } = require('../models/associations');
  const t = await sequelize.transaction();
  try {
    const { name, category, phone, address, city_id, description, branch_name } = req.body;
    if (!name || !category || !city_id || !address || !phone) {
      await t.rollback();
      return res.status(400).json({ error: 'name, category, city, address and phone are required' });
    }

    // A user can only own one brand for now (one business).
    const existing = await Brand.findOne({ where: { owner_id: req.user.id } });
    if (existing) {
      await t.rollback();
      return res.status(409).json({ error: 'You already have a business registered' });
    }

    // 1. Create the brand (the customer-facing storefront).
    const brand = await Brand.create({
      owner_id:    req.user.id,
      name,
      category,
      description: description || null,
      is_active:   false, // pending admin approval
    }, { transaction: t });

    // 2. Create the first branch (physical location).
    const vendor = await Vendor.create({
      owner_id:    req.user.id,
      brand_id:    brand.id,
      branch_name: branch_name || 'Main',
      name,               // branch display name (can differ later)
      category,
      phone,
      address,
      city_id,
      description: description || null,
      is_active:   false,
      is_open:     false,
    }, { transaction: t });

    // 3. Promote the user to the vendor role so they can access the console.
    await User.update({ role: 'vendor' }, { where: { id: req.user.id }, transaction: t });

    await t.commit();
    return res.status(201).json({
      message: 'Business registered — pending approval',
      brand, vendor,
    });
  } catch (err) {
    await t.rollback();
    console.error('createVendor error:', err.message);
    return res.status(500).json({ error: 'Failed to register business' });
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
  myBranches, addBranch,
};
