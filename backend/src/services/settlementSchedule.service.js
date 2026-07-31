function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + Number(days));
  return result;
}

function nextSettlementDate({
  schedule,
  from = new Date(),
}) {
  const date = new Date(from);

  if (schedule === 'daily') return addDays(date, 1);

  if (schedule === 'weekly') {
    return addDays(date, 7);
  }

  if (schedule === 'biweekly') {
    return addDays(date, 14);
  }

  if (schedule === 'monthly') {
    const next = new Date(date);
    next.setUTCMonth(next.getUTCMonth() + 1);
    return next;
  }

  const error = new Error('Unsupported settlement schedule');
  error.status = 422;
  error.code = 'INVALID_SETTLEMENT_SCHEDULE';
  throw error;
}

module.exports = {
  addDays,
  nextSettlementDate,
};
