const { Rider, Order } = require('../models/associations');

// GET /api/riders/profile
async function getProfile(req, res) {
  try {
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    return res.status(200).json({ rider });
  } catch (err) {
    console.error('getProfile error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch rider profile' });
  }
}

// PATCH /api/riders/online
async function toggleOnline(req, res) {
  try {
    const { is_online } = req.body;
    let rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found. Please complete rider registration.' });
    await rider.update({ is_online: !!is_online });
    return res.status(200).json({ message: 'Status updated', rider });
  } catch (err) {
    console.error('toggleOnline error:', err.message);
    return res.status(500).json({ error: 'Failed to update online status' });
  }
}

// PATCH /api/riders/location
async function updateLocation(req, res) {
  try {
    const { lat, lng } = req.body;
    if (lat == null || lng == null) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });

    await rider.update({
      current_location: { lat, lng, updated_at: new Date().toISOString() },
    });

    return res.status(200).json({ message: 'Location updated' });
  } catch (err) {
    console.error('updateLocation error:', err.message);
    return res.status(500).json({ error: 'Failed to update location' });
  }
}

// GET /api/riders/location/:orderId — customer fetches rider location for an order
async function getRiderLocationForOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Only the customer who placed it (or admin) can track
    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!order.rider_id) {
      return res.status(200).json({ location: null, message: 'No rider assigned yet' });
    }

    const rider = await Rider.findByPk(order.rider_id);
    if (!rider || !rider.current_location) {
      return res.status(200).json({ location: null, message: 'Rider location not available' });
    }

    return res.status(200).json({ location: rider.current_location });
  } catch (err) {
    console.error('getRiderLocationForOrder error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch rider location' });
  }
}

module.exports = { getProfile, toggleOnline, updateLocation, getRiderLocationForOrder };
