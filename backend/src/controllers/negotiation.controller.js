// backend/src/controllers/negotiation.controller.js
// inDrive-style fare negotiation for materials/errands.
const { Order, OrderOffer, Rider, User } = require('../models/associations');
const realtime = require('../realtime/socket');
const { getIO } = require('../realtime/socket');

// POST /api/orders/:id/offers   (rider)  { type: 'accept'|'counter', amount_usd, note }
// A rider accepts the customer's offered fare, or counters with their own.
async function makeOffer(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.is_negotiable) return res.status(400).json({ error: 'This order is not open for offers' });
    if (order.rider_id) return res.status(409).json({ error: 'This order already has a rider' });

    const { type, amount_usd, note } = req.body;
    const offerType = type === 'counter' ? 'counter' : 'accept';
    // Accept = take the customer's offered fare; counter = rider's own amount.
    const amount = offerType === 'accept'
      ? Number(order.offered_fare_usd)
      : Number(amount_usd);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'A valid amount is required' });

    // One live offer per rider per order — replace any prior pending one.
    await OrderOffer.destroy({ where: { order_id: order.id, rider_id: req.user.id, status: 'pending' } });

    const offer = await OrderOffer.create({
      order_id:   order.id,
      rider_id:   req.user.id,
      amount_usd: amount,
      type:       offerType,
      note:       note || null,
      status:     'pending',
    });

    // Notify the customer live that a new offer arrived.
    const io = getIO();
    if (io && order.customer_id) {
      io.to(`user:${order.customer_id}`).emit('offer:new', {
        orderId: order.id, offerId: offer.id,
      });
    }

    return res.status(201).json({ message: 'Offer submitted', offer });
  } catch (err) {
    console.error('makeOffer error:', err.message);
    return res.status(500).json({ error: 'Failed to submit offer' });
  }
}

// GET /api/orders/:id/offers   (customer) — all pending offers for their order.
async function listOffers(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not your order' });
    }

    const offers = await OrderOffer.findAll({
      where: { order_id: order.id, status: 'pending' },
      include: [{ model: User, as: 'rider', attributes: ['id', 'name'], required: false }],
      order: [['amount_usd', 'ASC']],
    });

    // Attach each rider's rating/vehicle for the customer to judge.
    const enriched = await Promise.all(offers.map(async (o) => {
      const oj = o.toJSON();
      const riderProfile = await Rider.findOne({
        where: { user_id: o.rider_id },
        attributes: ['vehicle_type', 'total_deliveries', 'rating'],
        raw: true,
      });
      return { ...oj, rider_profile: riderProfile || null };
    }));

    return res.status(200).json({ offers: enriched });
  } catch (err) {
    console.error('listOffers error:', err.message);
    return res.status(500).json({ error: 'Failed to load offers' });
  }
}

// POST /api/orders/:id/offers/:offerId/choose   (customer)
// Customer picks an offer → assigns that rider, locks the agreed fare.
async function chooseOffer(req, res) {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.customer_id !== req.user.id) return res.status(403).json({ error: 'Not your order' });
    if (order.rider_id) return res.status(409).json({ error: 'This order already has a rider' });

    const offer = await OrderOffer.findByPk(req.params.offerId);
    if (!offer || offer.order_id !== order.id) return res.status(404).json({ error: 'Offer not found' });
    if (offer.status !== 'pending') return res.status(400).json({ error: 'That offer is no longer available' });

    // Atomic assign: only if the order is still unclaimed (guards against the
    // order being taken between our check and this write).
    const [updatedCount] = await Order.update(
      {
        rider_id:         offer.rider_id,
        agreed_fare_usd:  offer.amount_usd,
        delivery_fee_usd: offer.amount_usd,   // the negotiated fare IS the delivery fee
        status:           'accepted',
        accepted_at:      new Date(),
      },
      { where: { id: order.id, rider_id: null } },
    );

    if (updatedCount === 0) {
      return res.status(409).json({ error: 'This order already has a rider' });
    }

    await order.reload();

    // Mark offers: chosen one wins, the rest are declined.
    await OrderOffer.update({ status: 'chosen' },   { where: { id: offer.id } });
    await OrderOffer.update({ status: 'declined' }, { where: { order_id: order.id, status: 'pending' } });

    // Real-time: tell the chosen rider they won; tell the others it's gone.
    const io = getIO();
    if (io) {
      io.to(`user:${offer.rider_id}`).emit('offer:chosen', { orderId: order.id });
      // The order is no longer available on any rider board.
      realtime.emitOrderUpdated(order);
    }

    return res.status(200).json({ message: 'Rider assigned', order });
  } catch (err) {
    console.error('chooseOffer error:', err.message);
    return res.status(500).json({ error: 'Failed to choose offer' });
  }
}

// GET /api/orders/negotiable   (rider) — open negotiable orders in the rider's city.
async function negotiableOrders(req, res) {
  try {
    const { City } = require('../models/associations');
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(200).json({ orders: [] });

    // Orders store city as a slug; resolve the rider's city slug to filter.
    let citySlug = null;
    if (rider.city_id) {
      const city = await City.findByPk(rider.city_id, { attributes: ['slug'], raw: true });
      citySlug = city?.slug || null;
    }

    const where = { is_negotiable: true, rider_id: null, status: 'pending' };
    if (citySlug) where.city = citySlug;

    const orders = await Order.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    // Include whether THIS rider already has a pending offer on each.
    const myOffers = await OrderOffer.findAll({
      where: { rider_id: req.user.id, status: 'pending' },
      attributes: ['order_id', 'amount_usd', 'type'], raw: true,
    });
    const mine = new Map(myOffers.map((o) => [o.order_id, o]));

    return res.status(200).json({
      orders: orders.map((o) => ({
        ...o.toJSON(),
        my_offer: mine.get(o.id) || null,
      })),
    });
  } catch (err) {
    console.error('negotiableOrders error:', err.message);
    return res.status(500).json({ error: 'Failed to load negotiable orders' });
  }
}

module.exports = { makeOffer, listOffers, chooseOffer, negotiableOrders };
