const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  registerVendor, getVendor, listVendors,
  updateVendor, addMenuItem, updateMenuItem, deleteMenuItem,
} = require('../controllers/vendor.controller');

// Public
router.get('/',           listVendors);
router.get('/:id',        getVendor);

// Vendor only
router.post('/',                        authenticate, requireRole(USER_ROLE.VENDOR), registerVendor);
router.put('/:id',                      authenticate, requireRole(USER_ROLE.VENDOR), updateVendor);
router.post('/:id/menu',                authenticate, requireRole(USER_ROLE.VENDOR), addMenuItem);
router.put('/:id/menu/:itemId',         authenticate, requireRole(USER_ROLE.VENDOR), updateMenuItem);
router.delete('/:id/menu/:itemId',      authenticate, requireRole(USER_ROLE.VENDOR), deleteMenuItem);

module.exports = router;