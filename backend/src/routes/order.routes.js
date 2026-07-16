const express = require('express');
const router  = express.Router();
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { loadOrder, activeRider } = require('../middleware/ownership.middleware');
const { USER_ROLE } = require('../config/constants');
const {
  placeOrder, quote, getOrder, myOrders, availableOrders, claimOrder,
  updateStatus, cancel, vendorOrders, rateOrder, upgradeVehicle,
} = require('../controllers/order.controller');

// Authorization is enforced HERE, in the route table — not scattered through the
// controllers. loadOrder() fetches the order and checks the caller's relationship
// to it before the handler runs, so a handler cannot forget to check because it
// never gets the chance.
//
// This replaces a set of hand-rolled checks that had drifted apart — and one that
// was missing entirely. GET /:id authorized customers and riders but silently let
// VENDORS through, so any vendor could read ANY order in the system, including a
// competitor's: customer names, phone numbers, delivery addresses, totals. Just by
// changing the UUID in the URL. That is closed below.

// ─── Customer ────────────────────────────────────────────────────────────────
router.post('/',      authenticate, requireRole(USER_ROLE.CUSTOMER), placeOrder);
router.post('/quote', authenticate, requireRole(USER_ROLE.CUSTOMER), quote);
router.get('/my',     authenticate, myOrders);

router.post('/:id/cancel',
  authenticate, requireRole(USER_ROLE.CUSTOMER),
  loadOrder({ allow: ['customer'] }),
  cancel);

router.post('/:id/rate',
  authenticate, requireRole(USER_ROLE.CUSTOMER),
  loadOrder({ allow: ['customer'] }),
  rateOrder);

// ─── Mzaya (rider) ───────────────────────────────────────────────────────────
// Static paths must precede /:id, or they get captured as an id.
router.get('/available',
  authenticate, requireRole(USER_ROLE.RIDER),
  activeRider(),
  availableOrders);

// Claiming is deliberately NOT behind loadOrder: an unclaimed order has no
// relationship to anyone yet. The controller does an atomic conditional update
// so two Mzayas can't claim the same job.
router.post('/:id/claim',
  authenticate, requireRole(USER_ROLE.RIDER),
  activeRider(),
  claimOrder);

router.patch('/:id/status',
  authenticate, requireRole(USER_ROLE.RIDER, USER_ROLE.ADMIN),
  loadOrder({ allow: ['rider'] }),
  updateStatus);

// ─── Vendor ──────────────────────────────────────────────────────────────────
router.get('/vendor',
  authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  vendorOrders);

router.post('/:id/upgrade-vehicle',
  authenticate, requireRole(USER_ROLE.VENDOR, USER_ROLE.ADMIN),
  loadOrder({ allow: ['vendor'] }),
  upgradeVehicle);

// ─── Read one order ──────────────────────────────────────────────────────────
// Must be LAST, or it swallows the static routes above.
//
// 'any' = the customer who placed it, the Mzaya delivering it, or the vendor
// fulfilling it. Everyone else gets a 403 — including a vendor with no connection
// to this order, which is exactly the hole that existed before.
router.get('/:id',
  authenticate,
  loadOrder({ allow: ['any'] }),
  getOrder);

module.exports = router;
