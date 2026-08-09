const {
  FinanceConsumerOffset,
} = require('../models/associations');

async function updateConsumerOffset({
  consumerKey,
  partitionKey = 'default',
  event,
}) {
  const lagSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(event.created_at).getTime()) / 1000)
  );

  const [offset] = await FinanceConsumerOffset.upsert({
    consumer_key: consumerKey,
    partition_key: partitionKey,
    last_event_id: event.id,
    last_event_created_at: event.created_at,
    last_processed_at: new Date(),
    lag_seconds: lagSeconds,
    status: 'active',
  }, { returning: true });

  return offset;
}

module.exports = {
  updateConsumerOffset,
};
