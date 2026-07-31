const {
  upsertSettlementProfile,
} = require('../services/settlementProfile.service');

async function upsert(req, res, next) {
  try {
    const profile = await upsertSettlementProfile({
      ownerType: req.body.ownerType,
      ownerId: req.body.ownerId,
      currency: req.body.currency,
      payoutMethod: req.body.payoutMethod,
      payoutDestination: req.body.payoutDestination,
      minimumPayoutMinor: req.body.minimumPayoutMinor,
      schedule: req.body.schedule,
      holdDays: req.body.holdDays,
    });

    return res.status(200).json({ profile });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  upsert,
};
