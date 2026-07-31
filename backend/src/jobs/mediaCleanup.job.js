const cron = require('node-cron');
const storage = require('../storage');
const {
  listExpiredSessions,
} = require('../services/uploadSession.service');

async function cleanupExpiredUploads({ logger = console } = {}) {
  const sessions = await listExpiredSessions();

  for (const session of sessions) {
    try {
      if (await storage.objectExists(session.storage_key)) {
        await storage.removeObject(session.storage_key);
      }
      await session.update({ status: 'expired' });
    } catch (error) {
      logger.warn('Failed to clean expired upload', {
        sessionId: session.id,
        error: error.message,
      });
    }
  }

  return sessions.length;
}

function scheduleMediaCleanup(options = {}) {
  return cron.schedule('17 * * * *', () => {
    cleanupExpiredUploads(options).catch((error) => {
      options.logger?.error?.('Media cleanup job failed', {
        error: error.message,
      });
    });
  });
}

module.exports = {
  cleanupExpiredUploads,
  scheduleMediaCleanup,
};
