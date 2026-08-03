const {
  GroupReportSnapshot,
} = require('../models/associations');

async function list(req, res, next) {
  try {
    const reports = await GroupReportSnapshot.findAll({
      order: [['generated_at', 'DESC']],
      limit: Math.min(Number(req.query.limit) || 100, 300),
    });
    return res.status(200).json({ reports });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list };
