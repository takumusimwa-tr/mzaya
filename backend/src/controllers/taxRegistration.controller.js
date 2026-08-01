const { TaxRegistration } = require('../models/associations');
const {
  upsertTaxRegistration,
} = require('../services/taxRegistration.service');

async function list(req, res, next) {
  try {
    const registrations = await TaxRegistration.findAll({
      order: [['effective_from', 'DESC']],
    });
    return res.status(200).json({ registrations });
  } catch (error) {
    return next(error);
  }
}

async function upsert(req, res, next) {
  try {
    const registration = await upsertTaxRegistration({
      ...req.body,
      actorId: req.user.id,
    });
    return res.status(200).json({ registration });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, upsert };
