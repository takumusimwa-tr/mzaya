const {
  getCustomerActiveOrder,
  getVendorLiveOrders,
  getRiderCurrentOrder,
  getRiderAvailableOrders,
} = require('../services/liveOrders.service');

async function customerActiveOrder(req, res, next) {
  try {
    const order = await getCustomerActiveOrder(req.user.id);
    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
}

async function vendorLiveOrders(req, res, next) {
  try {
    const orders = await getVendorLiveOrders({
      ownerUserId: req.user.id,
      vendorId: req.params.vendorId,
    });
    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
}

async function riderCurrentOrder(req, res, next) {
  try {
    const order = await getRiderCurrentOrder(req.user.id);
    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
}

async function riderAvailableOrders(req, res, next) {
  try {
    const orders = await getRiderAvailableOrders(req.user.id);
    return res.status(200).json({ orders });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  customerActiveOrder,
  vendorLiveOrders,
  riderCurrentOrder,
  riderAvailableOrders,
};
