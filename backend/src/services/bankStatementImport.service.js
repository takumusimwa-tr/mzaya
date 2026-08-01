const crypto = require('crypto');
const { sequelize } = require('../config/db');
const {
  BankAccount,
  BankStatementImport,
  BankStatementImportRow,
  BankTransaction,
} = require('../models/associations');
const {
  normalizeStatementRow,
} = require('./bankStatementParser.service');
const {
  treasuryReconciliationEvents,
  TREASURY_RECONCILIATION_EVENT,
} = require('../events/treasuryReconciliation.events');

function buildImportReference(bankAccountId) {
  return `BSI-${bankAccountId.slice(0, 8)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function importBankStatement({
  bankAccountId,
  sourceFormat,
  rows,
  importedBy,
  sourceStorageKey = null,
}) {
  const bankAccount = await BankAccount.findByPk(bankAccountId);
  if (!bankAccount) {
    const error = new Error('Bank account not found');
    error.status = 404;
    error.code = 'BANK_ACCOUNT_NOT_FOUND';
    throw error;
  }

  return sequelize.transaction(async (transaction) => {
    const statementImport = await BankStatementImport.create({
      bank_account_id: bankAccountId,
      import_reference: buildImportReference(bankAccountId),
      source_format: sourceFormat,
      source_storage_key: sourceStorageKey,
      imported_by: importedBy,
      status: 'processing',
    }, { transaction });

    let importedCount = 0;
    let earliestDate = null;
    let latestDate = null;

    for (let index = 0; index < rows.length; index += 1) {
      const rowNumber = index + 1;
      const raw = rows[index];

      try {
        const normalized = normalizeStatementRow(raw, rowNumber);

        await BankStatementImportRow.create({
          statement_import_id: statementImport.id,
          row_number: rowNumber,
          raw_data: raw,
          normalized_data: normalized,
          status: 'processed',
        }, { transaction });

        const [, created] = await BankTransaction.findOrCreate({
          where: {
            bank_account_id: bankAccountId,
            provider_reference: normalized.providerReference,
          },
          defaults: {
            statement_import_id: statementImport.id,
            transaction_date: normalized.transactionDate,
            value_date: normalized.valueDate,
            direction: normalized.direction,
            amount_minor: normalized.amountMinor,
            currency: bankAccount.currency,
            description: normalized.description,
            counterparty_name: normalized.counterpartyName,
            counterparty_reference: normalized.counterpartyReference,
            running_balance_minor: normalized.runningBalanceMinor,
          },
          transaction,
        });

        if (created) importedCount += 1;

        earliestDate = !earliestDate || normalized.transactionDate < earliestDate
          ? normalized.transactionDate
          : earliestDate;
        latestDate = !latestDate || normalized.transactionDate > latestDate
          ? normalized.transactionDate
          : latestDate;
      } catch (error) {
        await BankStatementImportRow.create({
          statement_import_id: statementImport.id,
          row_number: rowNumber,
          raw_data: raw,
          status: 'failed',
          error_message: String(error.message || error).slice(0, 1000),
        }, { transaction });
      }
    }

    await statementImport.update({
      status: 'completed',
      record_count: importedCount,
      statement_from: earliestDate,
      statement_to: latestDate,
      imported_at: new Date(),
    }, { transaction });

    transaction.afterCommit(() => {
      treasuryReconciliationEvents.emit(
        TREASURY_RECONCILIATION_EVENT.IMPORT_COMPLETED,
        {
          statementImportId: statementImport.id,
          bankAccountId,
          recordCount: importedCount,
        }
      );
    });

    return statementImport;
  });
}

module.exports = {
  buildImportReference,
  importBankStatement,
};
