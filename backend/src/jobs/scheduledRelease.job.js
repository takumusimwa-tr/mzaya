// backend/src/jobs/scheduledRelease.job.js
const cron = require('node-cron');
const { Op } = require('sequelize');
const { Order } = require('../models/associations');
const { ORDER_STATUS } = require('../config/constants');
const { findAvailableRider } = require('../services/dispatch.service');

// How far ahead of the delivery time we start trying to dispatch, so a rider
// is already assigned and en route by the requested time.
const LEAD_MINUTES = 45;

// Every minute: find scheduled orders due within the lead window and move them
// into the normal dispatch flow. Fees/vehicle were already locked at booking;
// here we only assign a rider (or leave pending for the claim board).
function startScheduledReleaseJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const cutoff = new Date(Date.now() + LEAD_MINUTES * 60 * 1000);

      const due = await Order.findAll({
        where: {
          status:        ORDER_STATUS.SCHEDULED,
          scheduled_for: { [Op.lte]: cutoff },
        },
        limit: 50,
      });

      if (!due.length) return;

      for (const order of due) {
        try {
          // Vehicle type was locked at booking; try to auto-assign a rider now.
          const rider = order.vehicle_type
            ? await findAvailableRider(order.city, order.vehicle_type)
            : null;

          await order.update({
            status:      rider ? ORDER_STATUS.ACCEPTED : ORDER_STATUS.PENDING,
            rider_id:    rider?.id || null,
            accepted_at: rider ? new Date() : null,
          });

          console.log(`[ScheduledRelease] Released order ${order.id.slice(0, 8)} → ${rider ? 'accepted' : 'pending'}`);
        } catch (e) {
          console.error(`[ScheduledRelease] Failed to release ${order.id.slice(0, 8)}:`, e.message);
        }
      }
    } catch (err) {
      console.error('[ScheduledRelease] Job error:', err.message);
    }
  }, {
    timezone: 'Africa/Harare',
  });

  console.log('[ScheduledRelease] Scheduled-order release job started (every minute)');
}

module.exports = { startScheduledReleaseJob };
