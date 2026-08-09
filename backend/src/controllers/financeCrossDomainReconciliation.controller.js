const {
  FinanceCrossDomainReconciliationRun,
  FinanceCrossDomainReconciliationException,
  FinanceDomainReconciliationSnapshot,
} = require('../models/associations');
const {
  runCrossDomainReconciliation,
} = require('../services/financeCrossDomainReconciliation.service');

async function dashboard(req, res, next) {
  try {
    const [runs, exceptions, snapshots] = await Promise.all([
      FinanceCrossDomainReconciliationRun.findAll({
        order: [['started_at', 'DESC']],
        limit: 100,
      }),
      FinanceCrossDomainReconciliationException.findAll({
        where: req.query.status
          ? { status: req.query.status }
          : undefined,
        order: [['created_at', 'DESC']],
        limit: 300,
      }),
      FinanceDomainReconciliationSnapshot.findAll({
        order: [['snapshot_at', 'DESC']],
        limit: 300,
      }),
    ]);

    return res.status(200).json({
      runs,
      exceptions,
      snapshots,
    });
  } catch (error) {
    return next(error);
  }
}

async function run(req, res, next) {
  try {
    return res.status(201).json(
      await runCrossDomainReconciliation({
        initiatedBy: req.user.id,
      })
    );
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  run,
};
