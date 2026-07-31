/**
 * MZAYA socket-room authorization.
 * Client supplied room identifiers are never trusted without a database check.
 */
const { Vendor, Rider, Order } = require('../models/associations');
const { USER_ROLE } = require('../config/constants');

async function canJoinVendor(user, vendorId) {
  if (!user || !vendorId) return false;
  if (user.role === USER_ROLE.ADMIN) return true;
  if (user.role !== USER_ROLE.VENDOR) return false;

  const branch = await Vendor.findByPk(vendorId, {
    attributes: ['owner_id'],
    raw: true,
  });

  return Boolean(branch && String(branch.owner_id) === String(user.id));
}

async function canJoinCity(user, cityId) {
  if (!user || !cityId) return false;
  if (user.role === USER_ROLE.ADMIN) return true;
  if (user.role !== USER_ROLE.RIDER) return false;

  const rider = await Rider.findOne({
    where: { user_id: user.id },
    attributes: ['city_id', 'is_approved'],
    raw: true,
  });

  return Boolean(
    rider &&
      rider.is_approved &&
      String(rider.city_id) === String(cityId)
  );
}

async function canJoinOrder(user, orderId) {
  if (!user || !orderId) return false;
  if (user.role === USER_ROLE.ADMIN) return true;

  const order = await Order.findByPk(orderId, {
    attributes: ['customer_id', 'rider_id', 'vendor_id'],
    raw: true,
  });
  if (!order) return false;

  if (String(order.customer_id) === String(user.id)) return true;
  if (String(order.rider_id) === String(user.id)) return true;

  if (user.role === USER_ROLE.VENDOR && order.vendor_id) {
    const branch = await Vendor.findByPk(order.vendor_id, {
      attributes: ['owner_id'],
      raw: true,
    });
    return Boolean(branch && String(branch.owner_id) === String(user.id));
  }

  return false;
}

module.exports = { canJoinVendor, canJoinCity, canJoinOrder };
