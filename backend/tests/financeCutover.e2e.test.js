const {
  resetDatabase,
  closeDatabase,
  makeUser,
} = require('./setup');
const {
  models,
} = require('./financeE2E.helpers');
const {
  assertLegacyPostingAllowed,
} = require('../src/services/financeLegacyPostingGuard.service');

const {
  FinanceCutoverControl,
  FinanceLegacyPostingAttempt,
} = models;

beforeAll(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

test('active block_legacy control rejects direct operational ledger path', async () => {
  const admin = await makeUser('admin');

  await FinanceCutoverControl.create({
    control_key: 'payments_e2e_cutover',
    name: 'Payments E2E cutover',
    domain_key: 'payments',
    current_mode: 'block_legacy',
    target_mode: 'event_engine',
    status: 'active',
    activated_by: admin.id,
    activated_at: new Date(),
  });

  await expect(
    assertLegacyPostingAllowed({
      sourceModule: 'payments',
      sourceAction: 'legacyPaymentPost',
      attemptedBy: admin.id,
      payload: {
        paymentId: '11111111-1111-4111-8111-111111111111',
      },
    })
  ).rejects.toMatchObject({
    code: 'LEGACY_LEDGER_POSTING_DISABLED',
  });

  const attempt = await FinanceLegacyPostingAttempt.findOne({
    where: {
      source_module: 'payments',
    },
    order: [['attempted_at', 'DESC']],
  });

  expect(attempt.result).toBe('blocked');
});
