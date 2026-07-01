const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { listAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/address.controller');

router.get('/',        authenticate, requireRole(USER_ROLE.CUSTOMER), listAddresses);
router.post('/',       authenticate, requireRole(USER_ROLE.CUSTOMER), addAddress);
router.put('/:id',     authenticate, requireRole(USER_ROLE.CUSTOMER), updateAddress);
router.delete('/:id',  authenticate, requireRole(USER_ROLE.CUSTOMER), deleteAddress);

module.exports = router;
