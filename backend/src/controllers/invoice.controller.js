const { TaxInvoice } = require('../models/associations');
const { generateTaxInvoice } = require('../services/invoiceGeneration.service');

async function create(req, res, next) {
  try {
    const invoice = await generateTaxInvoice({
      ...req.body,
      createdBy: req.user.id,
    });
    return res.status(201).json({ invoice });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const invoices = await TaxInvoice.findAll({
      order: [['issued_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });
    return res.status(200).json({ invoices });
  } catch (error) {
    return next(error);
  }
}

module.exports = { create, list };
