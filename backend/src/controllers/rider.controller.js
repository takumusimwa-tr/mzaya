const { Rider, City } = require('../models/associations');
const { Order } = require('../models/associations');
const { VEHICLE_RANK } = require('../config/constants');
const { logger } = require('../utils/logger');

// GET /api/riders/profile
async function getProfile(req, res) {
  try {
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    return res.status(200).json({ rider });
  } catch (err) {
    logger.error('getprofile_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch rider profile' });
  }
}

// PUT /api/riders/profile — create or update the rider's vehicle + city.
// This is how a rider completes setup after signup (RegisterPage only collects
// name/phone/password). Without a completed profile a rider has no vehicle_type
// or city_id, so they match no orders — which is correct until they set up.
async function upsertProfile(req, res) {
  try {
    const { vehicle_type, city_id, vehicle_plate, vehicle_model, national_id } = req.body;

    // Validate vehicle against the known spectrum
    if (!vehicle_type || !VEHICLE_RANK[vehicle_type]) {
      return res.status(400).json({ error: 'A valid vehicle type is required' });
    }
    if (!city_id) {
      return res.status(400).json({ error: 'City is required' });
    }
    // Confirm the city exists
    const city = await City.findByPk(city_id);
    if (!city) return res.status(400).json({ error: 'Invalid city' });

    let rider = await Rider.findOne({ where: { user_id: req.user.id } });

    if (rider) {
      await rider.update({
        vehicle_type,
        city_id,
        vehicle_plate: vehicle_plate ?? rider.vehicle_plate,
        vehicle_model: vehicle_model ?? rider.vehicle_model,
        national_id:   national_id   ?? rider.national_id,
      });
    } else {
      rider = await Rider.create({
        user_id:       req.user.id,
        vehicle_type,
        city_id,
        vehicle_plate: vehicle_plate || null,
        vehicle_model: vehicle_model || null,
        national_id:   national_id   || null,
        is_online:     false,
        // is_approved defaults per model; admin approval flow handles it later
      });
    }

    return res.status(200).json({ message: 'Rider profile saved', rider });
  } catch (err) {
    logger.error('upsertprofile_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to save rider profile' });
  }
}

// PATCH /api/riders/online
async function toggleOnline(req, res) {
  try {
    const { is_online } = req.body;
    let rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found. Please complete rider registration.' });

    // Guard: can't go online without a vehicle + city set
    if (is_online && (!rider.vehicle_type || !rider.city_id)) {
      return res.status(400).json({ error: 'Set your vehicle and city before going online' });
    }

    await rider.update({ is_online: !!is_online });
    return res.status(200).json({ message: 'Status updated', rider });
  } catch (err) {
    logger.error('toggleonline_error', { error: err.message });
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
    logger.error('updatelocation_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to update location' });
  }
}

// GET /api/riders/location/:orderId — customer fetches rider location for an order
async function getRiderLocationForOrder(req, res) {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.customer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!order.rider_id) {
      return res.status(200).json({ location: null, message: 'No rider assigned yet' });
    }

    const rider = await Rider.findOne({ where: { user_id: order.rider_id } });
    if (!rider || !rider.current_location) {
      return res.status(200).json({ location: null, message: 'Rider location not available' });
    }

    return res.status(200).json({ location: rider.current_location });
  } catch (err) {
    logger.error('getriderlocationfororder_error', { error: err.message });
    return res.status(500).json({ error: 'Failed to fetch rider location' });
  }
}

module.exports = {
  getProfile, upsertProfile, toggleOnline, updateLocation, getRiderLocationForOrder,
};
