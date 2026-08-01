const {
  TreasuryAlert,
  TreasuryLimit,
} = require('../models/associations');

async function dashboard(req, res, next) {
  try {
    const [alerts, limits] = await Promise.all([
      TreasuryAlert.findAll({
        where: { status: 'open' },
        order: [['severity', 'DESC'], ['detected_at', 'DESC']],
      }),
      TreasuryLimit.findAll({
        where: { status: 'active' },
        order: [['limit_type', 'ASC']],
      }),
    ]);

    return res.status(200).json({ alerts, limits });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
};
