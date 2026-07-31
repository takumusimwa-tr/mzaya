/**
 * ============================================================================
 * MZAYA
 * Service: Vendor
 * Path: backend/src/services/vendor.service.js
 * ----------------------------------------------------------------------------
 * Encapsulates vendor discovery, onboarding and profile persistence.
 * ============================================================================
 */

const {
  Vendor,
  MenuItem,
  City,
  Brand,
  User,
} = require('../models/associations');
const { sequelize } = require('../config/db');
const {
  attachLiveAvailability,
} = require('./vendorHours.service');
const {
  BranchServiceError,
  assertActiveCity,
  getOwnedBranch,
} = require('./branch.service');

const OWNER_EDITABLE_FIELDS = [
  'name',
  'description',
  'category',
  'phone',
  'address',
  'city_id',
  'location',
  'opening_hours',
  'is_paused',
  'logo_url',
  'cover_url',
];

const ADMIN_EDITABLE_FIELDS = [...OWNER_EDITABLE_FIELDS, 'is_active'];

function pickVendorFields(payload, user) {
  const allowed = user.role === 'admin'
    ? ADMIN_EDITABLE_FIELDS
    : OWNER_EDITABLE_FIELDS;

  return Object.fromEntries(
    allowed
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );
}

async function listVendors(filters = {}) {
  const where = { is_active: true };
  if (filters.category) where.category = filters.category;
  if (filters.city_id) where.city_id = filters.city_id;

  const rows = await Vendor.findAll({
    where,
    include: [
      {
        model: MenuItem,
        as: 'menuItems',
        where: { is_available: true },
        required: false,
      },
      { model: City, as: 'city', required: false },
    ],
    order: [['createdAt', 'DESC']],
  });

  let vendors = rows.map((vendor) =>
    attachLiveAvailability(vendor.toJSON())
  );

  if (filters.is_open !== undefined) {
    const expected = String(filters.is_open) === 'true';
    vendors = vendors.filter((vendor) => vendor.is_open === expected);
  }

  return vendors;
}

async function getPublicVendor(vendorId) {
  const vendor = await Vendor.findByPk(vendorId, {
    include: [
      {
        model: MenuItem,
        as: 'menuItems',
        where: { is_available: true },
        required: false,
      },
      { model: City, as: 'city', required: false },
    ],
  });

  if (!vendor) {
    throw new BranchServiceError('Vendor not found', 404, 'VENDOR_NOT_FOUND');
  }

  return attachLiveAvailability(vendor.toJSON());
}

async function getOwnerVendor(ownerId, branchId) {
  const where = { owner_id: ownerId };
  if (branchId) where.id = branchId;

  const vendor = await Vendor.findOne({
    where,
    include: [{ model: MenuItem, as: 'menuItems', required: false }],
    order: [['createdAt', 'ASC']],
  });

  if (!vendor) {
    throw new BranchServiceError(
      'Vendor profile not found',
      404,
      'VENDOR_PROFILE_NOT_FOUND'
    );
  }

  return attachLiveAvailability(vendor.toJSON());
}

async function createVendor(ownerId, payload) {
  return sequelize.transaction(async (transaction) => {
    const existing = await Brand.findOne({
      where: { owner_id: ownerId },
      transaction,
    });

    if (existing) {
      throw new BranchServiceError(
        'You already have a business registered',
        409,
        'BRAND_ALREADY_EXISTS'
      );
    }

    await assertActiveCity(payload.city_id, { transaction });

    const brand = await Brand.create(
      {
        owner_id: ownerId,
        name: payload.name,
        category: payload.category,
        description: payload.description || null,
        is_active: false,
      },
      { transaction }
    );

    const vendor = await Vendor.create(
      {
        owner_id: ownerId,
        brand_id: brand.id,
        branch_name: payload.branch_name || 'Main',
        name: payload.name,
        category: payload.category,
        phone: payload.phone,
        address: payload.address,
        city_id: payload.city_id,
        description: payload.description || null,
        is_active: false,
        is_open: false,
      },
      { transaction }
    );

    await User.update(
      { role: 'vendor' },
      { where: { id: ownerId }, transaction }
    );

    return { brand, vendor };
  });
}

async function updateVendor(vendorId, user, payload) {
  const vendor = await getOwnedBranch(vendorId, user);
  const patch = pickVendorFields(payload, user);

  if (patch.city_id) await assertActiveCity(patch.city_id);

  await vendor.update(patch);
  return attachLiveAvailability(vendor.toJSON());
}

module.exports = {
  OWNER_EDITABLE_FIELDS,
  ADMIN_EDITABLE_FIELDS,
  pickVendorFields,
  listVendors,
  getPublicVendor,
  getOwnerVendor,
  createVendor,
  updateVendor,
};
