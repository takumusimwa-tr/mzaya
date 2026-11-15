const { Op } = require('sequelize');
const AdCampaign = require('../models/adCampaignModel');
const { Brand, Vendor } = require('../models/associations');

const CATEGORIES = new Set(['food', 'grocery', 'materials']);
const FIELDS = ['brand_id', 'city_id', 'category', 'title', 'description', 'image_url', 'cta', 'starts_at', 'ends_at'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function valid(data) {
  if (!UUID.test(data.brand_id || '') || !UUID.test(data.city_id || '') || !CATEGORIES.has(data.category)) return false;
  if (typeof data.title !== 'string' || !data.title.trim() || data.title.length > 100) return false;
  if (data.description != null && (typeof data.description !== 'string' || data.description.length > 240)) return false;
  if (data.cta != null && (typeof data.cta !== 'string' || data.cta.length > 40)) return false;
  if (data.image_url != null && (typeof data.image_url !== 'string' || data.image_url.length > 1024 || !/^https:\/\//.test(data.image_url))) return false;
  const start = Date.parse(data.starts_at), end = Date.parse(data.ends_at);
  return Number.isFinite(start) && Number.isFinite(end) && end > start;
}
async function eligible(campaign) {
  const brand = await Brand.findByPk(campaign.brand_id);
  if (!brand || !brand.is_active || brand.category !== campaign.category) return false;
  return Boolean(await Vendor.findOne({ where: { brand_id: brand.id, city_id: campaign.city_id, is_active: true } }));
}
async function discover(req, res) {
  try {
    const { city_id, category } = req.query;
    if (!UUID.test(city_id || '') || !CATEGORIES.has(category)) return res.status(400).json({ error: 'Valid city and category required' });
    const now = new Date();
    const rows = await AdCampaign.findAll({ where: { city_id, category, status: 'approved', starts_at: { [Op.lte]: now }, ends_at: { [Op.gt]: now } }, order: [['createdAt', 'DESC']], limit: 30 });
    const campaigns = [];
    for (const row of rows) {
      if (!(await eligible(row))) continue;
      campaigns.push({ id: row.id, type: 'vendor', status: 'approved', active: true, title: row.title, description: row.description, image: row.image_url, cta: row.cta, href: `/vendor/${(await Vendor.findOne({ where: { brand_id: row.brand_id, city_id, is_active: true }, attributes: ['id'] })).id}?brand=${row.brand_id}` });
      if (campaigns.length >= 8) break;
    }
    return res.json({ campaigns });
  } catch (error) { return res.status(500).json({ error: 'Could not load campaigns' }); }
}
async function myCampaigns(req, res) {
  try {
    const brands = await Brand.findAll({ where: { owner_id: req.user.id }, attributes: ['id', 'name', 'category'] });
    const ids = brands.map((brand) => brand.id);
    if (!ids.length) return res.json({ campaigns: [], brands: [] });
    const campaigns = await AdCampaign.findAll({ where: { brand_id: { [Op.in]: ids } }, order: [['createdAt', 'DESC']], limit: 100 });
    return res.json({ campaigns, brands });
  } catch (error) { return res.status(500).json({ error: 'Could not load your campaigns' }); }
}
async function createMine(req, res) {
  try {
    const data = Object.fromEntries(FIELDS.filter((key) => Object.hasOwn(req.body || {}, key)).map((key) => [key, req.body[key]]));
    const brand = UUID.test(data.brand_id || '') ? await Brand.findByPk(data.brand_id) : null;
    if (!brand || brand.owner_id !== req.user.id) return res.status(403).json({ error: 'Brand is not owned by this account' });
    if (!valid(data) || !(await eligible(data))) return res.status(400).json({ error: 'Invalid campaign or inactive vendor in target city' });
    const campaign = await AdCampaign.create({ ...data, status: 'draft' });
    return res.status(201).json({ campaign });
  } catch (error) { return res.status(500).json({ error: 'Could not create campaign' }); }
}
async function submitMine(req, res) {
  try {
    const campaign = await AdCampaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    const brand = await Brand.findByPk(campaign.brand_id);
    if (!brand || brand.owner_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (!['draft', 'rejected'].includes(campaign.status)) return res.status(409).json({ error: 'Only draft or rejected campaigns can be submitted' });
    if (!(await eligible(campaign))) return res.status(400).json({ error: 'Vendor not eligible' });
    await campaign.update({ status: 'pending' });
    return res.json({ campaign });
  } catch (error) { return res.status(500).json({ error: 'Could not submit campaign' }); }
}
async function list(req, res) {
  try { return res.json({ campaigns: await AdCampaign.findAll({ order: [['createdAt', 'DESC']], limit: 100 }) }); }
  catch (error) { return res.status(500).json({ error: 'Could not load campaigns' }); }
}
async function create(req, res) {
  try {
    const data = Object.fromEntries(FIELDS.filter((key) => Object.hasOwn(req.body || {}, key)).map((key) => [key, req.body[key]]));
    if (!valid(data) || !(await eligible(data))) return res.status(400).json({ error: 'Invalid campaign or inactive vendor in target city' });
    const campaign = await AdCampaign.create({ ...data, status: 'draft' });
    return res.status(201).json({ campaign });
  } catch (error) { return res.status(500).json({ error: 'Could not create campaign' }); }
}
async function update(req, res) {
  try {
    const campaign = await AdCampaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    const patch = Object.fromEntries(FIELDS.filter((key) => Object.hasOwn(req.body || {}, key)).map((key) => [key, req.body[key]]));
    const next = { ...campaign.get({ plain: true }), ...patch };
    if (!valid(next) || !(await eligible(next))) return res.status(400).json({ error: 'Invalid campaign or inactive vendor in target city' });
    // Editing an approved campaign requires reapproval.
    await campaign.update({ ...patch, status: 'draft' });
    return res.json({ campaign });
  } catch (error) { return res.status(500).json({ error: 'Could not update campaign' }); }
}
async function setStatus(req, res) {
  try {
    const { status } = req.body || {};
    if (!['pending', 'approved', 'rejected', 'paused'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const campaign = await AdCampaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (status === 'approved' && !(await eligible(campaign))) return res.status(400).json({ error: 'Vendor not eligible' });
    await campaign.update({ status });
    return res.json({ campaign });
  } catch (error) { return res.status(500).json({ error: 'Could not update campaign status' }); }
}
module.exports = { discover, list, create, update, setStatus, myCampaigns, createMine, submitMine };
