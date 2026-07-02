const express = require('express');
const router  = express.Router();
const { VEHICLE_META, VEHICLE_RANK, VEHICLE_MAX_KG } = require('../config/constants');

// GET /api/vehicles
// Returns the full vehicle spectrum in display order so the frontend never
// hardcodes the list. Public — needed by the rider onboarding form before a
// rider account exists, and by checkout to label the required vehicle.
router.get('/', (req, res) => {
  const vehicles = Object.keys(VEHICLE_RANK)
    .sort((a, b) => VEHICLE_RANK[a] - VEHICLE_RANK[b])
    .map((cls) => ({
      value: cls,
      name:  VEHICLE_META[cls]?.name || cls,
      hint:  VEHICLE_META[cls]?.hint || '',
      rank:  VEHICLE_RANK[cls],
      maxKg: VEHICLE_MAX_KG[cls] === Infinity ? null : VEHICLE_MAX_KG[cls],
    }));
  res.status(200).json({ vehicles });
});

module.exports = router;
