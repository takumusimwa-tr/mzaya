// backend/src/controllers/chat.controller.js
const {
  Order, OrderMessage, User, Vendor,
  OrderFood, OrderGrocery, OrderMaterials,
} = require('../models/associations');
const { getIO } = require('../realtime/socket');
const { logger } = require('../utils/logger');

// Active window where communication is allowed.
const ACTIVE_STATUSES = ['accepted', 'preparing', 'ready', 'picked_up', 'en_route'];

// Resolve the three party user-ids for an order + the sender's role.
async function resolveParticipants(order) {
  // Vendor owner via the order's detail table → vendor → owner_id.
  let vendorOwnerId = null;
  const food = await OrderFood.findOne({ where: { order_id: order.id }, attributes: ['restaurant_id'], raw: true });
  const groc = food ? null : await OrderGrocery.findOne({ where: { order_id: order.id }, attributes: ['store_id'], raw: true });
  const mat  = (food || groc) ? null : await OrderMaterials.findOne({ where: { order_id: order.id }, attributes: ['supplier_id'], raw: true });
  const vendorId = food?.restaurant_id || groc?.store_id || mat?.supplier_id || null;
  if (vendorId) {
    const v = await Vendor.findByPk(vendorId, { attributes: ['owner_id'], raw: true });
    vendorOwnerId = v?.owner_id || null;
  }
  return {
    customerId: order.customer_id,
    riderId:    order.rider_id,
    vendorOwnerId,
    vendorId,
  };
}

function roleOf(userId, parties) {
  if (userId === parties.customerId)    return 'customer';
  if (userId === parties.riderId)       return 'rider';
  if (userId === parties.vendorOwnerId) return 'vendor';
  return null;
}

// GET /api/orders/:id/messages
async function listMessages(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const parties = await resolveParticipants(order);
    const role = roleOf(req.user.id, parties);
    if (!role && req.user.role !== 'admin') return res.status(403).json({ error: 'Not part of this order' });

    const messages = await OrderMessage.findAll({
      where: { order_id: order.id },
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'], required: false }],
      order: [['createdAt', 'ASC']],
    });

    // Mark others' messages as read.
    await OrderMessage.update(
      { read_at: new Date() },
      { where: { order_id: order.id, sender_id: { [require('sequelize').Op.ne]: req.user.id }, read_at: null } }
    );

    return res.status(200).json({ messages, my_role: role });
  } catch (err) {
    logger.error('listmessages_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load messages' });
  }
}

// POST /api/orders/:id/messages   { body }
async function sendMessage(req, res) {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const parties = await resolveParticipants(order);
    const role = roleOf(req.user.id, parties);
    if (!role) return res.status(403).json({ error: 'Not part of this order' });

    // Only allow chat while the order is live.
    if (!ACTIVE_STATUSES.includes(order.status)) {
      return res.status(400).json({ error: 'This order is not active' });
    }

    const message = await OrderMessage.create({
      order_id:    order.id,
      sender_id:   req.user.id,
      sender_role: role,
      body:        body.trim(),
    });

    const full = await OrderMessage.findByPk(message.id, {
      include: [{ model: User, as: 'sender', attributes: ['id', 'name'], required: false }],
    });

    // Push to the other participants live.
    const io = getIO();
    if (io) {
      const recipients = [parties.customerId, parties.riderId, parties.vendorOwnerId].filter(
        (uid) => uid && uid !== req.user.id
      );
      for (const uid of recipients) {
        io.to(`user:${uid}`).emit('chat:new', { orderId: order.id, message: full });
      }
    }

    return res.status(201).json({ message: full });
  } catch (err) {
    logger.error('sendmessage_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to send message' });
  }
}

// GET /api/orders/:id/contacts — the OTHER parties' name/phone/role for
// click-to-call. Numbers only exposed while the order is active.
async function orderContacts(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const parties = await resolveParticipants(order);
    const role = roleOf(req.user.id, parties);
    if (!role && req.user.role !== 'admin') return res.status(403).json({ error: 'Not part of this order' });

    const active = ACTIVE_STATUSES.includes(order.status);
    if (!active) return res.status(200).json({ contacts: [], active: false });

    // Build the list of the other parties.
    const ids = [
      { id: parties.customerId,    role: 'customer' },
      { id: parties.riderId,       role: 'rider' },
      { id: parties.vendorOwnerId, role: 'vendor' },
    ].filter((p) => p.id && p.id !== req.user.id);

    const contacts = [];
    for (const p of ids) {
      const u = await User.findByPk(p.id, { attributes: ['id', 'name', 'phone'], raw: true });
      if (u) contacts.push({ role: p.role, name: u.name, phone: u.phone });
    }

    return res.status(200).json({ contacts, active: true });
  } catch (err) {
    logger.error('ordercontacts_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to load contacts' });
  }
}

module.exports = { listMessages, sendMessage, orderContacts };
