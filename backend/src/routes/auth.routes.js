const express = require('express');
const router = express.Router();
const { register, login, me, updateMe } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me  (protected)
router.get('/me', authenticate, me);

// PATCH /api/auth/me — narrow self-service profile update.
// Role/verification/password/location remain outside this contract.
router.patch('/me', authenticate, updateMe);

module.exports = router;
