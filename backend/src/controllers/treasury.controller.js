const {
  TreasuryAccount,
  BankAccount,
  LiquiditySnapshot,
} = require('../models/associations');
const { getLiquidityPosition } = require('../services/liquidity.service');

async function accounts(req, res, next) {
  try {
    const treasuryAccounts = await TreasuryAccount.findAll({
      include: [{ model: BankAccount, as: 'bankAccounts' }],
      order: [['name', 'ASC']],
    });
    return res.status(200).json({ accounts: treasuryAccounts });
  } catch (error) {
    return next(error);
  }
}

async function liquidity(req, res, next) {
  try {
    const position = await getLiquidityPosition({
      currency: req.query.currency,
    });
    return res.status(200).json({ position });
  } catch (error) {
    return next(error);
  }
}

async function trend(req, res, next) {
  try {
    const snapshots = await LiquiditySnapshot.findAll({
      where: { currency: req.query.currency },
      order: [['snapshot_date', 'ASC']],
      limit: Math.min(Number(req.query.limit) || 60, 365),
    });
    return res.status(200).json({ snapshots });
  } catch (error) {
    return next(error);
  }
}

module.exports = { accounts, liquidity, trend };
