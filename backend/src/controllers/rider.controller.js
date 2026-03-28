const { Rider, City } = require('../models/associations');

// ─── Register rider profile ───────────────────────────────────────────────────
async function registerRider(req, res) {
  try {
    const { city_id, vehicle_type, vehicle_plate, vehicle_model, national_id } = req.body;

    if (!city_id || !vehicle_type) {
      return res.status(400).json({ error: 'city_id and vehicle_type are required' });
    }

    const existing = await Rider.findOne({ where: { user_id: req.user.id } });
    if (existing) return res.status(409).json({ error: 'Rider profile already exists' });

    const rider = await Rider.create({
      user_id:       req.user.id,
      city_id,
      vehicle_type,
      vehicle_plate: vehicle_plate || null,
      vehicle_model: vehicle_model || null,
      national_id:   national_id || null,
    });

    return res.status(201).json({
      message: 'Rider profile created — pending admin approval',
      rider,
    });
  } catch (err) {
    console.error('registerRider error:', err.message);
    return res.status(500).json({ error: 'Could not register rider' });
  }
}

// ─── Get rider profile ────────────────────────────────────────────────────────
async function getRiderProfile(req, res) {
  try {
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    return res.status(200).json({ rider });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Toggle online status ─────────────────────────────────────────────────────
async function toggleOnline(req, res) {
  try {
    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });
    if (!rider.is_approved) return res.status(403).json({ error: 'Rider not yet approved' });

    await rider.update({ is_online: !rider.is_online });
    return res.status(200).json({
      message: `You are now ${rider.is_online ? 'online' : 'offline'}`,
      is_online: rider.is_online,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// ─── Update rider location ────────────────────────────────────────────────────
async function updateLocation(req, res) {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });

    const rider = await Rider.findOne({ where: { user_id: req.user.id } });
    if (!rider) return res.status(404).json({ error: 'Rider profile not found' });

    await rider.update({
      current_location: { lat, lng, updated_at: new Date() },
    });

    return res.status(200).json({ message: 'Location updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { registerRider, getRiderProfile, toggleOnline, updateLocation };