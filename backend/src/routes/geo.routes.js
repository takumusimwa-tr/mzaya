// backend/src/routes/geo.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { resolvePin } = require('../controllers/geo.controller');

// POST /api/geo/resolve-pin — any authenticated user can resolve a pin at checkout.
router.post('/resolve-pin', authenticate, resolvePin);

module.exports = router;
