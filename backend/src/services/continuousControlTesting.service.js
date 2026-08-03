const crypto = require('crypto');
const {
  FinancialApprovalRequest,
  FinancialApprovalDecision,
  LedgerTransaction,
  LedgerEntry,
  TreasuryTransfer,
  TreasuryReconciliation,
  FinanceContinuousControlResult,
} = require('../models/associations');

async function testMakerChecker({
  from,
  to,
}) {
  const requests = await FinancialApprovalRequest.findAll({
    where: {
      created_at: {
        [require('sequelize').Op.between]: [from, to],
      },
    },
    include: [{
      model: FinancialApprovalDecision,
      as: 'decisions',
      required: false,
    }],
  });

  const exceptions = requests.filter((request) =>
    (request.decisions || []).some(
      (decision) => String(decision.decided_by) === String(request.requested_by)
    )
  );

  return {
    controlKey: 'maker_checker',
    testName: 'Maker-checker separation',
    populationSize: requests.length,
    exceptionsCount: exceptions.length,
    details: { exceptionIds: exceptions.map((item) => item.id) },
  };
}

async function testLedgerBalance({
  from,
  to,
}) {
  const transactions = await LedgerTransaction.findAll({
    where: {
      created_at: {
        [require('sequelize').Op.between]: [from, to],
      },
      status: 'posted',
    },
    include: [{
      model: LedgerEntry,
      as: 'entries',
      required: true,
    }],
  });

  const exceptions = transactions.filter((transaction) => {
    const debit = transaction.entries
      .filter((entry) => entry.direction === 'debit')
      .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);
    const credit = transaction.entries
      .filter((entry) => entry.direction === 'credit')
      .reduce((sum, entry) => sum + Number(entry.amount_minor), 0);
    return debit !== credit;
  });

  return {
    controlKey: 'ledger_integrity',
    testName: 'Posted ledger transaction balance',
    populationSize: transactions.length,
    exceptionsCount: exceptions.length,
    details: { exceptionIds: exceptions.map((item) => item.id) },
  };
}

async function persistControlResult(result, from, to) {
  return FinanceContinuousControlResult.create({
    control_key: result.controlKey,
    run_reference: `CCT-${crypto.randomUUID().slice(0, 10).toUpperCase()}`,
    test_name: result.testName,
    test_period_from: from,
    test_period_to: to,
    population_size: result.populationSize,
    exceptions_count: result.exceptionsCount,
    result: result.exceptionsCount === 0 ? 'passed' : 'failed',
    details: result.details,
  });
}

module.exports = {
  testMakerChecker,
  testLedgerBalance,
  persistControlResult,
};
