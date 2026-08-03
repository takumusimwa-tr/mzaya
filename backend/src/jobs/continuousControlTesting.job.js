const cron = require('node-cron');
const {
  testMakerChecker,
  testLedgerBalance,
  persistControlResult,
} = require('../services/continuousControlTesting.service');

function startContinuousControlTestingJob({ logger = console } = {}) {
  return cron.schedule('0 4 * * *', async () => {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);

    const tests = [testMakerChecker, testLedgerBalance];

    for (const test of tests) {
      try {
        const result = await test({ from, to });
        await persistControlResult(result, from, to);
      } catch (error) {
        logger.error?.('continuous_control_test_failed', {
          test: test.name,
          error: error.message,
        });
      }
    }
  });
}

module.exports = { startContinuousControlTestingJob };
