const {
  FinanceMasterDataDomain, FinanceMasterDataRecord,
  FinanceMasterDataVersion, FinancePeriodLock,
} = require('../models/associations');
const { createMasterDataRecord } = require('../services/financeMasterData.service');
const { createPeriodLock, unlockPeriod } = require('../services/financePeriodLock.service');

async function dashboard(req, res, next) {
  try {
    const [domains, records, periodLocks] = await Promise.all([
      FinanceMasterDataDomain.findAll({ where: { status: 'active' }, order: [['name', 'ASC']] }),
      FinanceMasterDataRecord.findAll({
        include: [{ model: FinanceMasterDataVersion, as: 'currentVersion', required: false }],
        order: [['updated_at', 'DESC']], limit: 300,
      }),
      FinancePeriodLock.findAll({ order: [['period_key', 'DESC']], limit: 200 }),
    ]);
    return res.status(200).json({ domains, records, periodLocks });
  } catch (error) { return next(error); }
}

async function createRecord(req, res, next) {
  try {
    return res.status(201).json(await createMasterDataRecord({ ...req.body, createdBy: req.user.id }));
  } catch (error) { return next(error); }
}

async function lockPeriod(req, res, next) {
  try {
    const lock = await createPeriodLock({ ...req.body, lockedBy: req.user.id });
    return res.status(201).json({ lock });
  } catch (error) { return next(error); }
}

async function unlockPeriodAction(req, res, next) {
  try {
    const lock = await unlockPeriod({ periodLockId: req.params.periodLockId, unlockedBy: req.user.id });
    return res.status(200).json({ lock });
  } catch (error) { return next(error); }
}

module.exports = { dashboard, createRecord, lockPeriod, unlockPeriodAction };
