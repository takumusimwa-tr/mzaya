// backend/src/routes/browse.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { browseBrands, browseProducts } = require('../controllers/browse.controller');

// Both require an authenticated customer (any logged-in user).
router.get('/brands',   authenticate, browseBrands);
router.get('/products', authenticate, browseProducts);

module.exports = router;
