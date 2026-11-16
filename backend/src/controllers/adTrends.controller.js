const { QueryTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const AdCampaign = require('../models/adCampaignModel');
const { Brand } = require('../models/associations');

// UTC reporting periods, with zero-filled days. No personal identifiers are stored.
async function trends(req, res) {
  try {
    const days = Number(req.query.days || 14);
    if (![7, 14, 30].includes(days)) return res.status(400).json({ error: 'Choose 7, 14 or 30 days' });
    const admin = req.user.role === 'admin';
    let where = {};
    if (!admin) {
      const brands = await Brand.findAll({ where: { owner_id: req.user.id }, attributes: ['id'] });
      const ids = brands.map(b => b.id);
      if (!ids.length) return res.json({ days, series: [], total: { impressions: 0, clicks: 0, ctr: 0 } });
      where = { brand_id: { [Op.in]: ids } };
    }
    const campaigns = await AdCampaign.findAll({ where, attributes: ['id'], raw: true });
    const ids = campaigns.map(c => c.id);
    const today = new Date();
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    const start = new Date(end.getTime() - days * 86400000);
    const counts = ids.length ? await sequelize.query(`
      SELECT (occurred_at AT TIME ZONE 'UTC')::date::text AS day, event_type,
             COUNT(*)::integer AS count
      FROM public.ad_campaign_events
      WHERE campaign_id IN (:ids) AND occurred_at >= :start AND occurred_at < :end
      GROUP BY day, event_type
    `, { replacements: { ids, start, end }, type: QueryTypes.SELECT }) : [];
    const map = new Map();
    for (let i = 0; i < days; i++) {
      const date = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
      map.set(date, { date, impressions: 0, clicks: 0, ctr: 0 });
    }
    for (const c of counts) {
      const item = map.get(c.day);
      if (item && (c.event_type === 'impression' || c.event_type === 'click')) item[c.event_type === 'impression' ? 'impressions' : 'clicks'] = Number(c.count);
    }
    const series = [...map.values()];
    let impressions = 0, clicks = 0;
    for (const item of series) {
      item.ctr = item.impressions ? Number((item.clicks * 100 / item.impressions).toFixed(2)) : 0;
      impressions += item.impressions;
      clicks += item.clicks;
    }
    return res.json({ days, timezone: 'UTC', series, total: { impressions, clicks, ctr: impressions ? Number((clicks * 100 / impressions).toFixed(2)) : 0 } });
  } catch (error) {
    return res.status(503).json({ error: 'Advertising trends temporarily unavailable' });
  }
}
module.exports = { trends };
