const metrics = {
  created: 0,
  delivered: 0,
  failed: 0,
  skipped: 0,
  retried: 0,
};

function incrementNotificationMetric(name, amount = 1) {
  if (!(name in metrics)) return;
  metrics[name] += amount;
}

function getNotificationMetrics() {
  return { ...metrics };
}

function resetNotificationMetrics() {
  for (const key of Object.keys(metrics)) {
    metrics[key] = 0;
  }
}

module.exports = {
  incrementNotificationMetric,
  getNotificationMetrics,
  resetNotificationMetrics,
};
