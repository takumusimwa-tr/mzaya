const {
  ingestReconciliationRecord,
  listReconciliationExceptions,
} = require('../services/reconciliation.service');

async function ingest(req, res, next) {
  try {
    const record = await ingestReconciliationRecord({
      provider: req.body.provider,
      providerReference: req.body.providerReference,
      internalReference: req.body.internalReference,
      recordType: req.body.recordType,
      currency: req.body.currency,
      providerAmountMinor: req.body.providerAmountMinor,
      providerPayload: req.body.providerPayload,
    });

    return res.status(201).json({ record });
  } catch (error) {
    return next(error);
  }
}

async function exceptions(req, res, next) {
  try {
    const records = await listReconciliationExceptions({
      status: req.query.status
        ? String(req.query.status).split(',')
        : undefined,
      limit: req.query.limit,
    });

    return res.status(200).json({ records });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ingest,
  exceptions,
};
