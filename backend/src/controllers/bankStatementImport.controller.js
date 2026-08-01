const {
  BankStatementImport,
} = require('../models/associations');
const {
  importBankStatement,
} = require('../services/bankStatementImport.service');

async function create(req, res, next) {
  try {
    const statementImport = await importBankStatement({
      bankAccountId: req.body.bankAccountId,
      sourceFormat: req.body.sourceFormat,
      rows: req.body.rows,
      importedBy: req.user.id,
      sourceStorageKey: req.body.sourceStorageKey,
    });

    return res.status(201).json({ statementImport });
  } catch (error) {
    return next(error);
  }
}

async function list(req, res, next) {
  try {
    const imports = await BankStatementImport.findAll({
      order: [['created_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });

    return res.status(200).json({ imports });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  create,
  list,
};
