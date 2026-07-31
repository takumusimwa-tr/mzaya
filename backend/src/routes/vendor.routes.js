/**
 * ============================================================================
 * MZAYA
 * Routes: Vendors
 * Path: backend/src/routes/vendor.routes.js
 * ----------------------------------------------------------------------------
 * Vendor mutations now use shared validation, branch ownership, and audit
 * middleware. Public API paths remain unchanged.
 * ============================================================================
 */

const express = require('express');
const router = express.Router();

const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { validateRequest } = require('../middleware/validateRequest');
const { requireBranch } = require('../middleware/requireBranch');
const { auditLogger } = require('../middleware/auditLogger');

const {
  createVendorSchema,
  addBranchSchema,
  ownerVendorUpdateSchema,
  adminVendorUpdateSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
} = require('../validators/vendor.validator');

const {
  listVendors,
  getMyVendor,
  getVendor,
  createVendor,
  updateVendor,
  myBranches,
  addBranch,
} = require('../controllers/vendor.controller');

const {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menu.controller');

function vendorUpdateValidation(req, res, next) {
  const schema =
    req.user?.role === USER_ROLE.ADMIN
      ? adminVendorUpdateSchema
      : ownerVendorUpdateSchema;

  return validateRequest(schema)(req, res, next);
}

// Public
router.get('/', listVendors);

// Vendor/Admin — /my must come before /:id
router.get(
  '/my',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  getMyVendor
);

router.get(
  '/my/branches',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  myBranches
);

router.post(
  '/my/branches',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  validateRequest(addBranchSchema),
  auditLogger('create', 'vendor_branch', {
    resourceId: (_req) => null,
  }),
  addBranch
);

// Onboarding is available to an authenticated customer before their role changes.
router.post(
  '/',
  authenticate,
  validateRequest(createVendorSchema),
  auditLogger('create', 'vendor_business', {
    resourceId: (_req) => null,
  }),
  createVendor
);

// Public
router.get('/:id', getVendor);

// Vendor/Admin mutations
router.put(
  '/:id',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  requireBranch(),
  vendorUpdateValidation,
  auditLogger('update', 'vendor_branch'),
  updateVendor
);

router.post(
  '/:id/menu',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  requireBranch(),
  validateRequest(createMenuItemSchema),
  auditLogger('create', 'menu_item', {
    resourceId: (req) => req.branch?.id,
  }),
  addMenuItem
);

router.put(
  '/:id/menu/:itemId',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  requireBranch(),
  validateRequest(updateMenuItemSchema),
  auditLogger('update', 'menu_item', {
    resourceId: (req) => req.params.itemId,
    metadata: (req) => ({ branchId: req.branch?.id }),
  }),
  updateMenuItem
);

router.delete(
  '/:id/menu/:itemId',
  authenticate,
  requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  requireBranch(),
  auditLogger('delete', 'menu_item', {
    resourceId: (req) => req.params.itemId,
    metadata: (req) => ({ branchId: req.branch?.id }),
  }),
  deleteMenuItem
);

module.exports = router;
