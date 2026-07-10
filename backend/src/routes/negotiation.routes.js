// backend/src/routes/negotiation.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  makeOffer, listOffers, chooseOffer, negotiableOrders,
} = require('../controllers/negotiation.controller');

// Rider: browse negotiable orders + make offers
router.get('/negotiable', authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN), negotiableOrders);
router.post('/:id/offers', authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN), makeOffer);

// Customer: see + choose offers
router.get('/:id/offers', authenticate, listOffers);
router.post('/:id/offers/:offerId/choose', authenticate, chooseOffer);

module.exports = router;
