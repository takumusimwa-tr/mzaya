// backend/src/routes/negotiation.routes.js
const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { loadOrder, activeRider } = require('../middleware/ownership.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  makeOffer, listOffers, chooseOffer, negotiableOrders,
} = require('../controllers/negotiation.controller');

// ─── Mzaya: browse open jobs, bid on them ────────────────────────────────────
// Static path first, or /:id swallows it.
router.get('/negotiable',
  authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN),
  activeRider(),
  negotiableOrders);

// Offering is NOT behind loadOrder: a negotiable order is open to any Mzaya in
// the city — that's the point. The controller checks it's still unclaimed and
// still negotiable.
router.post('/:id/offers',
  authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN),
  activeRider(),
  makeOffer);

// ─── Customer: read and choose offers ────────────────────────────────────────
// Guarded: the offers on an order reveal which Mzayas are nearby, their ratings
// and their prices. Only the person who posted the job sees them.
router.get('/:id/offers',
  authenticate,
  loadOrder({ allow: ['customer'] }),
  listOffers);

router.post('/:id/offers/:offerId/choose',
  authenticate,
  loadOrder({ allow: ['customer'] }),
  chooseOffer);

module.exports = router;
