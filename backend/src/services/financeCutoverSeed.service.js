const {
  FinanceCutoverControl,
} = require('../models/associations');
const {
  controls,
} = require('../config/financeCutover.seed');

async function ensureFinanceCutoverControls() {
  for (const control of controls) {
    await FinanceCutoverControl.findOrCreate({
      where: {
        control_key: control.control_key,
      },
      defaults: {
        ...control,
        description:
          `Controlled migration of ${control.domain_key} accounting to the finance event engine.`,
        current_mode: 'legacy',
        target_mode: 'event_engine',
        status: 'planned',
      },
    });
  }
}

module.exports = {
  ensureFinanceCutoverControls,
};
