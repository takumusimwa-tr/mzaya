const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const { listFavorites, favoriteIds, toggleFavorite } = require('../controllers/favorite.controller');

router.get('/',            authenticate, requireRole(USER_ROLE.CUSTOMER), listFavorites);
router.get('/ids',         authenticate, requireRole(USER_ROLE.CUSTOMER), favoriteIds);
router.post('/:vendorId',  authenticate, requireRole(USER_ROLE.CUSTOMER), toggleFavorite);

module.exports = router;
