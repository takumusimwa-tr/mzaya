const {
  TreasuryCashPool,
  TreasuryCashPoolMember,
} = require('../models/associations');
const {
  buildCashPoolSweepPlan,
} = require('../services/cashPooling.service');

async function list(req, res, next) {
  try {
    const pools = await TreasuryCashPool.findAll({
      include: [{
        model: TreasuryCashPoolMember,
        as: 'members',
      }],
      order: [['name', 'ASC']],
    });

    return res.status(200).json({ pools });
  } catch (error) {
    return next(error);
  }
}

async function plan(req, res, next) {
  try {
    const result = await buildCashPoolSweepPlan(req.params.cashPoolId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  plan,
};
