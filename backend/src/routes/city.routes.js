const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { listCities, createCity, seedCities } = require('../controllers/city.controller');

// Public
router.get('/', listCities);

// Admin only
router.post('/',      authenticate, requireRole(USER_ROLE.ADMIN), createCity);
router.post('/seed',  authenticate, requireRole(USER_ROLE.ADMIN), seedCities);

module.exports = router;