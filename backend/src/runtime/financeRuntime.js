const {
  startFinanceOutboxPublisherJob,
} = require('../jobs/financeOutboxPublisher.job');
const {
  startFinanceDeliveryRecoveryJob,
} = require('../jobs/financeDeliveryRecovery.job');
const {
  startFinanceDeadLetterEscalationJob,
} = require('../jobs/financeDeadLetterEscalation.job');
const {
  startFinanceReliabilitySnapshotJob,
} = require('../jobs/financeReliabilitySnapshot.job');
const {
  startFinanceReplayJob,
} = require('../jobs/financeReplay.job');
const {
  startPostingFailureJob,
} = require('../jobs/postingFailure.job');
const {
  startOrphanEventJob,
} = require('../jobs/orphanEvent.job');
const {
  startPaymentFinanceReconciliationJob,
} = require('../jobs/paymentFinanceReconciliation.job');
const {
  startOrderFinanceReconciliationJob,
} = require('../jobs/orderFinanceReconciliation.job');
const {
  startVendorSettlementReconciliationJob,
} = require('../jobs/vendorSettlementReconciliation.job');
const {
  startMzayaPayoutReconciliationJob,
} = require('../jobs/mzayaPayoutReconciliation.job');
const {
  startProcurementFinanceReconciliationJob,
} = require('../jobs/procurementFinanceReconciliation.job');
const {
  startTreasuryFinanceReconciliationJob,
} = require('../jobs/treasuryFinanceReconciliation.job');
const {
  startBankMovementMatchingJob,
} = require('../jobs/bankMovementMatching.job');
const {
  startTaxFinanceReconciliationJob,
} = require('../jobs/taxFinanceReconciliation.job');
const {
  startFinanceCrossDomainReconciliationJob,
} = require('../jobs/financeCrossDomainReconciliation.job');
const {
  startFinanceCutoverReadinessJob,
} = require('../jobs/financeCutoverReadiness.job');
const {
  initializeFinanceEventBridge,
} = require('../realtime/financeEventBridge');
const {
  initializeFinanceDeliveryEventBridge,
} = require('../realtime/financeDeliveryEventBridge');
const {
  ensureFinanceCutoverControls,
} = require('../services/financeCutoverSeed.service');
const {
  ensureFinancePostingConfiguration,
} = require('../services/financePostingSeed.service');
const {
  startFinanceBusinessEventProcessorJob,
} = require('../jobs/financeBusinessEventProcessor.job');
const {
  startFinanceAccountingPosterJob,
} = require('../jobs/financeAccountingPoster.job');

async function startFinanceRuntime({ io, logger = console }) {
  await ensureFinanceCutoverControls();
  await ensureFinancePostingConfiguration();

  const jobs = [
    startFinanceOutboxPublisherJob({ logger }),
    startFinanceBusinessEventProcessorJob({ logger }),
    startFinanceAccountingPosterJob({ logger }),
    startFinanceDeliveryRecoveryJob({ logger }),
    startFinanceDeadLetterEscalationJob({ logger }),
    startFinanceReliabilitySnapshotJob({ logger }),
    startFinanceReplayJob({ logger }),
    startPostingFailureJob({ logger }),
    startOrphanEventJob({ logger }),
    startPaymentFinanceReconciliationJob({ logger }),
    startOrderFinanceReconciliationJob({ logger }),
    startVendorSettlementReconciliationJob({ logger }),
    startMzayaPayoutReconciliationJob({ logger }),
    startProcurementFinanceReconciliationJob({ logger }),
    startTreasuryFinanceReconciliationJob({ logger }),
    startBankMovementMatchingJob({ logger }),
    startTaxFinanceReconciliationJob({ logger }),
    startFinanceCrossDomainReconciliationJob({ logger }),
    startFinanceCutoverReadinessJob({ logger }),
  ];

  const cleanupBridges = [
    initializeFinanceEventBridge(io),
    initializeFinanceDeliveryEventBridge(io),
  ];

  logger.info?.('finance_runtime_started', {
    jobs: jobs.length,
    realtimeBridges: cleanupBridges.length,
  });

  return {
    stop() {
      jobs.forEach((job) => {
        try {
          job?.stop?.();
        } catch (error) {
          logger.error?.('finance_job_stop_failed', {
            error: error.message,
          });
        }
      });

      cleanupBridges.forEach((cleanup) => {
        try {
          cleanup?.();
        } catch (error) {
          logger.error?.('finance_bridge_cleanup_failed', {
            error: error.message,
          });
        }
      });
    },
  };
}

module.exports = {
  startFinanceRuntime,
};
