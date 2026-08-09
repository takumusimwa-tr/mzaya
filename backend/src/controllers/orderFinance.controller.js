const {
  OrderFinanceReconciliationResult,
} = require('../models/associations');
const {
  reconcileOrder,
} = require('../services/orderFinanceReconciliation.service');

async function list(req, res, next) {
  try {
    const where = {};

    if (req.query.orderType) {
      where.order_type = req.query.orderType;
    }

    const results = await OrderFinanceReconciliationResult.findAll({
      where,
      order: [['evaluated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ results });
  } catch (error) {
    return next(error);
  }
}

async function reconcile(req, res, next) {
  try {
    const result = await reconcileOrder({
      orderId: req.params.orderId,
      orderType: req.params.orderType,
    });

    return res.status(200).json({ result });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  reconcile,
};
