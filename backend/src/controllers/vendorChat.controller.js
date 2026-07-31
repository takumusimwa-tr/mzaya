const {
  getVendorConversation,
  listVendorConversations,
} = require('../services/vendorConversation.service');
const {
  ensureOrderConversation,
} = require('../services/orderConversation.service');

async function list(req, res, next) {
  try {
    const result = await listVendorConversations({
      vendorUserId: req.user.id,
      cursor: req.query.cursor,
      limit: req.query.limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

async function getByOrder(req, res, next) {
  try {
    const conversation = await getVendorConversation({
      orderId: req.params.orderId,
      vendorUserId: req.user.id,
    });

    return res.status(200).json({ conversation });
  } catch (error) {
    return next(error);
  }
}

async function ensure(req, res, next) {
  try {
    const conversation = await ensureOrderConversation({
      orderId: req.params.orderId,
      requestedBy: req.user.id,
      includeMzaya: req.body.includeMzaya !== false,
    });

    return res.status(200).json({ conversation });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  getByOrder,
  ensure,
};
