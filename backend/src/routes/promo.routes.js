// backend/src/routes/promo.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  validateCode, listPromos, createPromo, updatePromo, deletePromo,
} = require('../controllers/promo.controller');

// Customer — validate a code against their cart
router.post('/validate', authenticate, requireRole(USER_ROLE.CUSTOMER), validateCode);

// Admin — manage codes
router.get('/',        authenticate, requireRole(USER_ROLE.ADMIN), listPromos);
router.post('/',       authenticate, requireRole(USER_ROLE.ADMIN), createPromo);
router.patch('/:id',   authenticate, requireRole(USER_ROLE.ADMIN), updatePromo);
router.delete('/:id',  authenticate, requireRole(USER_ROLE.ADMIN), deletePromo);

module.exports = router;
