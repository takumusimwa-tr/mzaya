// backend/src/middleware/ownership.middleware.js
//
// Resource-level authorization.
//
// Ownership was checked by hand in 13 places across the controllers, and the
// checks had already drifted apart: some allowed admins through, some didn't;
// some said "Access denied", others "Not your order". That inconsistency is the
// bug waiting to happen — the next endpoint someone adds is the one where the
// check gets forgotten entirely, and a customer can read another customer's
// order by changing a UUID in the URL.
//
// So: one place, one rule, loaded before the controller ever runs. The controller
// then gets `req.order` already fetched and already authorized, and can't forget
// to check because it never had the choice.
const { Order, Vendor, Rider } = require('../models/associations');
const { logger } = require('../utils/logger');

const ROLES = { ADMIN: 'admin', CUSTOMER: 'customer', RIDER: 'rider', VENDOR: 'vendor' };

// Log every denial. A spike of these is either a bug or someone probing.
function deny(req, res, reason, meta = {}) {
  logger.warn('authz_denied', {
    reqId: req.id,
    userId: req.user?.id,
    role: req.user?.role,
    path: req.originalUrl,
    reason,
    ...meta,
  });
  return res.status(403).json({ error: 'Access denied' });
}

/**
 * Load an order and authorize the caller against it.
 *
 *   router.get('/:id', authenticate, loadOrder({ allow: ['customer'] }), getOrder)
 *
 * `allow` lists which RELATIONSHIPS to the order may proceed:
 *   'customer' — the customer who placed it
 *   'rider'    — the Mzaya assigned to it
 *   'vendor'   — the owner of the branch fulfilling it
 *   'any'      — any of the above
 *
 * Admins always pass (they run the platform), and that is now consistent —
 * previously some endpoints let them through and others didn't, for no reason
 * beyond who wrote which controller.
 */
function loadOrder({ allow = ['customer'], param = 'id' } = {}) {
  return async (req, res, next) => {
    try {
      const orderId = req.params[param];
      if (!orderId) return res.status(400).json({ error: 'Order id is required' });

      const order = await Order.findByPk(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });

      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Not authenticated' });

      // Admins run the platform.
      if (user.role === ROLES.ADMIN) {
        req.order = order;
        return next();
      }

      const wants = allow.includes('any')
        ? ['customer', 'rider', 'vendor']
        : allow;

      // ── Customer ──
      if (wants.includes('customer') && order.customer_id === user.id) {
        req.order = order;
        return next();
      }

      // ── Rider (the Mzaya assigned to this delivery) ──
      // orders.rider_id references users(id).
      if (wants.includes('rider') && order.rider_id && order.rider_id === user.id) {
        req.order = order;
        return next();
      }

      // ── Vendor (owner of the branch fulfilling it) ──
      if (wants.includes('vendor') && user.role === ROLES.VENDOR) {
        const vendorId = await resolveOrderVendorId(order.id);
        if (vendorId) {
          const branch = await Vendor.findByPk(vendorId, { attributes: ['owner_id'], raw: true });
          if (branch && branch.owner_id === user.id) {
            req.order = order;
            req.vendorId = vendorId;
            return next();
          }
        }
      }

      return deny(req, res, 'not_related_to_order', { orderId });
    } catch (err) {
      logger.error('load_order_error', { reqId: req.id, error: err.message });
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Authorize a vendor against a branch they claim to own.
 *
 *   router.patch('/:id', authenticate, ownsBranch(), updateBranch)
 */
function ownsBranch({ param = 'id' } = {}) {
  return async (req, res, next) => {
    try {
      const branchId = req.params[param] || req.query.branch_id || req.body.branch_id;
      if (!branchId) return res.status(400).json({ error: 'branch_id is required' });

      const branch = await Vendor.findByPk(branchId);
      if (!branch) return res.status(404).json({ error: 'Branch not found' });

      if (req.user.role === ROLES.ADMIN) {
        req.branch = branch;
        return next();
      }
      if (branch.owner_id !== req.user.id) {
        return deny(req, res, 'not_branch_owner', { branchId });
      }

      req.branch = branch;
      return next();
    } catch (err) {
      logger.error('owns_branch_error', { reqId: req.id, error: err.message });
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

/**
 * Ensure the caller is an approved, set-up Mzaya before they can take work.
 */
function activeRider() {
  return async (req, res, next) => {
    try {
      if (req.user.role === ROLES.ADMIN) return next();
      if (req.user.role !== ROLES.RIDER) return deny(req, res, 'not_a_rider');

      const rider = await Rider.findOne({ where: { user_id: req.user.id } });
      if (!rider) return res.status(400).json({ error: 'Complete your Mzaya setup first' });
      if (!rider.is_approved) return res.status(403).json({ error: 'Your Mzaya account is pending approval' });

      req.rider = rider;
      return next();
    } catch (err) {
      logger.error('active_rider_error', { reqId: req.id, error: err.message });
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

// Which branch is fulfilling this order? Walks the per-category detail tables.
async function resolveOrderVendorId(orderId) {
  const { OrderFood, OrderGrocery, OrderMaterials } = require('../models/associations');

  const food = await OrderFood.findOne({ where: { order_id: orderId }, attributes: ['restaurant_id'], raw: true });
  if (food?.restaurant_id) return food.restaurant_id;

  const groc = await OrderGrocery.findOne({ where: { order_id: orderId }, attributes: ['store_id'], raw: true });
  if (groc?.store_id) return groc.store_id;

  const mat = await OrderMaterials.findOne({ where: { order_id: orderId }, attributes: ['supplier_id'], raw: true });
  if (mat?.supplier_id) return mat.supplier_id;

  return null;   // errands have no vendor
}

module.exports = { loadOrder, ownsBranch, activeRider, resolveOrderVendorId };
