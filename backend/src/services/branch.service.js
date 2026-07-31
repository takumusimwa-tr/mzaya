/**
 * ============================================================================
 * MZAYA
 * Service: Branch
 * Path: backend/src/services/branch.service.js
 * ----------------------------------------------------------------------------
 * Encapsulates branch lookup, ownership and branch creation rules.
 * ============================================================================
 */

const { Brand, City, Vendor } = require('../models/associations');
const { attachLiveAvailability } = require('./vendorHours.service');

class BranchServiceError extends Error {
  constructor(message, status = 400, code = 'BRANCH_ERROR') {
    super(message);
    this.name = 'BranchServiceError';
    this.status = status;
    this.code = code;
  }
}

async function getOwnedBranch(branchId, user, options = {}) {
  const branch = await Vendor.findByPk(branchId, options);

  if (!branch) {
    throw new BranchServiceError('Branch not found', 404, 'BRANCH_NOT_FOUND');
  }

  if (user.role !== 'admin' && branch.owner_id !== user.id) {
    throw new BranchServiceError('Access denied', 403, 'BRANCH_ACCESS_DENIED');
  }

  return branch;
}

async function getOwnerBranches(ownerId) {
  const branches = await Vendor.findAll({
    where: { owner_id: ownerId },
    include: [{ model: City, as: 'city', required: false }],
    order: [['createdAt', 'ASC']],
  });

  return branches.map((branch) => {
    const value = attachLiveAvailability(branch.toJSON());
    return {
      id: value.id,
      branch_name: value.branch_name,
      name: value.name,
      city: value.city?.name || null,
      address: value.address,
      is_active: value.is_active,
      is_open: value.is_open,
    };
  });
}

async function assertActiveCity(cityId, options = {}) {
  const city = await City.findByPk(cityId, options);
  if (!city || city.is_active === false) {
    throw new BranchServiceError(
      'Select an active city',
      400,
      'CITY_UNAVAILABLE'
    );
  }
  return city;
}

async function createBranchForOwner(ownerId, payload) {
  const brand = await Brand.findOne({ where: { owner_id: ownerId } });

  if (!brand) {
    throw new BranchServiceError(
      'No brand found — register a business first',
      404,
      'BRAND_NOT_FOUND'
    );
  }

  await assertActiveCity(payload.city_id);

  return Vendor.create({
    owner_id: ownerId,
    brand_id: brand.id,
    branch_name: payload.branch_name || 'Branch',
    name: brand.name,
    category: brand.category,
    description: brand.description,
    logo_url: brand.logo_url,
    cover_url: brand.cover_url,
    phone: payload.phone,
    address: payload.address,
    city_id: payload.city_id,
    is_active: false,
    is_open: false,
  });
}

module.exports = {
  BranchServiceError,
  getOwnedBranch,
  getOwnerBranches,
  assertActiveCity,
  createBranchForOwner,
};
