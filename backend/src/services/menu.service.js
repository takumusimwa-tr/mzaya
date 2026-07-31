/**
 * ============================================================================
 * MZAYA
 * Service: Vendor Menu
 * Path: backend/src/services/menu.service.js
 * ----------------------------------------------------------------------------
 * Owns menu-item persistence and guarantees item/vendor isolation.
 * ============================================================================
 */

const { MenuItem } = require('../models/associations');
const { getOwnedBranch, BranchServiceError } = require('./branch.service');

const MENU_FIELDS = [
  'name',
  'description',
  'price_usd',
  'category',
  'prep_minutes',
  'weight_kg',
  'image_url',
  'is_available',
];

function pickMenuFields(payload) {
  return Object.fromEntries(
    MENU_FIELDS
      .filter((field) => payload[field] !== undefined)
      .map((field) => [field, payload[field]])
  );
}

async function getOwnedMenuItem(vendorId, itemId, user) {
  await getOwnedBranch(vendorId, user);

  const item = await MenuItem.findOne({
    where: { id: itemId, vendor_id: vendorId },
  });

  if (!item) {
    throw new BranchServiceError(
      'Item not found for this vendor',
      404,
      'MENU_ITEM_NOT_FOUND'
    );
  }

  return item;
}

async function createMenuItem(vendorId, user, payload) {
  await getOwnedBranch(vendorId, user);
  const fields = pickMenuFields(payload);

  return MenuItem.create({
    vendor_id: vendorId,
    ...fields,
    prep_minutes: fields.prep_minutes ?? 0,
    weight_kg: fields.weight_kg ?? 0,
    image_url: fields.image_url || null,
    is_available: fields.is_available ?? true,
  });
}

async function updateMenuItem(vendorId, itemId, user, payload) {
  const item = await getOwnedMenuItem(vendorId, itemId, user);
  await item.update(pickMenuFields(payload));
  return item;
}

async function deleteMenuItem(vendorId, itemId, user) {
  const item = await getOwnedMenuItem(vendorId, itemId, user);
  await item.destroy();
}

module.exports = {
  MENU_FIELDS,
  pickMenuFields,
  getOwnedMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
