const { sequelize } = require('../config/db');
const { InvoiceSequence } = require('../models/associations');

async function nextInvoiceNumber({
  jurisdictionId,
  documentType,
  fiscalYear,
  transaction: externalTransaction,
}) {
  const execute = async (transaction) => {
    const sequence = await InvoiceSequence.findOne({
      where: {
        jurisdiction_id: jurisdictionId,
        document_type: documentType,
        fiscal_year: fiscalYear,
        status: 'active',
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!sequence) {
      const error = new Error('Invoice sequence not configured');
      error.status = 409;
      error.code = 'INVOICE_SEQUENCE_NOT_CONFIGURED';
      throw error;
    }

    const current = Number(sequence.next_number);
    await sequence.update({
      next_number: current + 1,
    }, { transaction });

    return `${sequence.prefix}${String(current).padStart(sequence.padding, '0')}`;
  };

  if (externalTransaction) return execute(externalTransaction);
  return sequelize.transaction(execute);
}

module.exports = { nextInvoiceNumber };
