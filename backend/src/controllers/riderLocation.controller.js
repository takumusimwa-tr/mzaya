const { updateRiderLocation } = require('../services/riderLocation.service');

async function updateLocation(req, res, next) {
  try {
    const result = await updateRiderLocation({
      riderUserId: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng,
      accuracy: req.body.accuracy,
      heading: req.body.heading,
      speed: req.body.speed,
      recordedAt: req.body.recorded_at,
    });

    return res.status(200).json({
      message: 'Location updated',
      location: result.location,
      active_order_ids: result.activeOrderIds,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { updateLocation };
