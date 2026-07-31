const {
  processDueDeliveries,
} = require('../services/notificationQueue.service');

let timer = null;
let running = false;

async function tick() {
  if (running) return;
  running = true;

  try {
    await processDueDeliveries(
      Number(process.env.NOTIFICATION_RETRY_BATCH_SIZE || 50)
    );
  } catch (error) {
    console.error('notification_retry_job_failed', {
      message: error.message,
    });
  } finally {
    running = false;
  }
}

function startNotificationRetryJob() {
  if (timer) return;

  const intervalMs = Number(
    process.env.NOTIFICATION_RETRY_INTERVAL_MS || 60_000
  );

  timer = setInterval(tick, intervalMs);
  timer.unref?.();
  tick();
}

function stopNotificationRetryJob() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}

module.exports = {
  tick,
  startNotificationRetryJob,
  stopNotificationRetryJob,
};
