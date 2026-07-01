const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  listVendors, getMyVendor, getVendor,
  createVendor, updateVendor,
  addMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/vendor.controller');

// Public
router.get('/', listVendors);

// Vendor/Admin — /my must come before /:id
router.get('/my', authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), getMyVendor);

// Public
router.get('/:id', getVendor);

// Vendor/Admin
router.post('/',                      authenticate, requireRole(USER_ROLE.VENDOR), createVendor);
router.put('/:id',                    authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), updateVendor);
router.post('/:id/menu',              authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), addMenuItem);
router.put('/:id/menu/:itemId',       authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), updateMenuItem);
router.delete('/:id/menu/:itemId',    authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN), deleteMenuItem);

module.exports = router;
