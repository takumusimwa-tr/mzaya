const { Vendor } = require('../models/associations');

async function resolveOrderRecipients(order) {
  const recipients = [];

  if (order.customer_id) {
    recipients.push({
      userId: order.customer_id,
      audience: 'customer',
    });
  }

  if (order.rider_id) {
    recipients.push({
      userId: order.rider_id,
      audience: 'rider',
    });
  }

  if (order.vendor_id) {
    const vendor = await Vendor.findByPk(order.vendor_id, {
      attributes: ['id', 'owner_id'],
      raw: true,
    });

    if (vendor?.owner_id) {
      recipients.push({
        userId: vendor.owner_id,
        audience: 'vendor',
      });
    }
  }

  const seen = new Set();
  return recipients.filter((recipient) => {
    const key = `${recipient.audience}:${recipient.userId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = { resolveOrderRecipients };
