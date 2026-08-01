const {
  approveTreasuryTransfer,
  executeTreasuryTransfer,
} = require('../services/treasuryTransferExecution.service');

async function approve(req, res, next) {
  try {
    const transfer = await approveTreasuryTransfer({
      transferId: req.params.transferId,
      approverId: req.user.id,
    });
    return res.status(200).json({ transfer });
  } catch (error) {
    return next(error);
  }
}

async function execute(req, res, next) {
  try {
    const transfer = await executeTreasuryTransfer({
      transferId: req.params.transferId,
      actorId: req.user.id,
    });
    return res.status(200).json({ transfer });
  } catch (error) {
    return next(error);
  }
}

module.exports = { approve, execute };
