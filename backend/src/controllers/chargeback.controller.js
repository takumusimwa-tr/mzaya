const {
  registerChargeback,
  updateChargebackOutcome,
  listChargebackQueue,
} = require('../services/chargeback.service');

async function register(req, res, next) {
  try {
    const chargeback = await registerChargeback(req.body);
    return res.status(201).json({ chargeback });
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const chargeback = await updateChargebackOutcome({
      chargebackId: req.params.chargebackId,
      outcome: req.body.outcome,
    });
    return res.status(200).json({ chargeback });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const chargebacks = await listChargebackQueue(req.query);
    return res.status(200).json({ chargebacks });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, update, list };
