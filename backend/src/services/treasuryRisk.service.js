const {
  TreasuryLimit,
  TreasuryAlert,
  TreasuryFxExposure,
} = require('../models/associations');

async function evaluateTreasuryLimits({
  currency,
  exposureMinor,
}) {
  const limits = await TreasuryLimit.findAll({
    where: {
      limit_type: 'fx_exposure',
      status: 'active',
      currency,
    },
  });

  const alerts = [];

  for (const limit of limits) {
    if (
      limit.threshold_minor != null &&
      Math.abs(Number(exposureMinor)) > Number(limit.threshold_minor)
    ) {
      const [alert] = await TreasuryAlert.findOrCreate({
        where: {
          limit_id: limit.id,
          alert_type: 'fx_exposure_limit',
          status: 'open',
        },
        defaults: {
          severity: limit.severity,
          title: `${currency} exposure exceeds treasury limit`,
          description: `Net exposure exceeded configured limit ${limit.limit_key}.`,
          resource_type: 'treasury_fx_exposure',
          detected_value: {
            exposureMinor,
            thresholdMinor: Number(limit.threshold_minor),
            currency,
          },
        },
      });

      alerts.push(alert);
    }
  }

  return alerts;
}

module.exports = {
  evaluateTreasuryLimits,
};
