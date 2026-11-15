const { QueryTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');
const AdCampaign = require('../models/adCampaignModel');
const { Brand, Vendor } = require('../models/associations');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TYPES = new Set(['impression', 'click']);

async function eligible(campaign) {
  const brand = await Brand.findByPk(campaign.brand_id);
  if (!brand || !brand.is_active || brand.category !== campaign.category) return false;
  return Boolean(await Vendor.findOne({ where: { brand_id: campaign.brand_id, city_id: campaign.city_id, is_active: true } }));
}

async function record(req, res) {
  const { campaign_id, event_type, event_key } = req.body || {};
  if (![campaign_id, event_key].every(v => typeof v === 'string' && UUID.test(v)) || !TYPES.has(event_type)) {
    return res.status(400).json({ error: 'Invalid advertising event' });
  }
  try {
    const now = new Date();
    const campaign = await AdCampaign.findOne({ where: {
      id: campaign_id, status: 'approved', starts_at: { [Op.lte]: now }, ends_at: { [Op.gt]: now },
    } });
    if (!campaign || !(await eligible(campaign))) return res.status(404).json({ error: 'Campaign unavailable' });
    await sequelize.query(`INSERT INTO public.ad_campaign_events (campaign_id, event_type, event_key)
      VALUES (:campaign_id, :event_type, :event_key)
      ON CONFLICT (campaign_id, event_type, event_key) DO NOTHING`, {
      replacements: { campaign_id, event_type, event_key }, type: QueryTypes.INSERT,
    });
    return res.status(204).end();
  } catch (error) {
    return res.status(503).json({ error: 'Advertising analytics temporarily unavailable' });
  }
}

async function summary(req, res) {
  try {
    const isAdmin = req.user.role === 'admin';
    let brandIds = null;
    if (!isAdmin) {
      const brands = await Brand.findAll({ where: { owner_id: req.user.id }, attributes: ['id'] });
      brandIds = brands.map(b => b.id);
      if (!brandIds.length) return res.json({ campaigns: [] });
    }
    const campaigns = await AdCampaign.findAll({
      ...(brandIds ? { where: { brand_id: { [Op.in]: brandIds } } } : {}),
      attributes: ['id', 'brand_id', 'title', 'status'],
      order: [['createdAt', 'DESC']], limit: 100,
    });
    if (!campaigns.length) return res.json({ campaigns: [] });
    const ids = campaigns.map(c => c.id);
    const counts = await sequelize.query(`SELECT campaign_id, event_type, COUNT(*)::integer AS total
      FROM public.ad_campaign_events WHERE campaign_id IN (:ids)
      GROUP BY campaign_id, event_type`, { replacements: { ids }, type: QueryTypes.SELECT });
    const byId = new Map();
    for (const count of counts) {
      const key = String(count.campaign_id);
      const item = byId.get(key) || { impressions: 0, clicks: 0 };
      if (count.event_type === 'impression') item.impressions = Number(count.total);
      if (count.event_type === 'click') item.clicks = Number(count.total);
      byId.set(key, item);
    }
    return res.json({ campaigns: campaigns.map(c => {
      const metrics = byId.get(String(c.id)) || { impressions: 0, clicks: 0 };
      return { id: c.id, brand_id: c.brand_id, title: c.title, status: c.status,
        ...metrics, ctr: metrics.impressions ? Number((metrics.clicks / metrics.impressions * 100).toFixed(2)) : 0 };
    }) });
  } catch (error) {
    return res.status(503).json({ error: 'Advertising analytics temporarily unavailable' });
  }
}
module.exports = { record, summary };
