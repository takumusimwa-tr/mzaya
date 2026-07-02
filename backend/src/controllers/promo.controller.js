// backend/src/controllers/promo.controller.js
const { Promo } = require('../models/associations');
const { evaluatePromo } = require('../utils/promoEval');
const { quoteOrder } = require('../services/order.service');

// POST /api/promos/validate  { code, category_type, detail }
// Customer-facing: checks a code against the current cart and returns the
// discount preview. Reuses quoteOrder to get the authoritative subtotal + fee.
async function validateCode(req, res) {
  try {
    const { code, category_type, detail } = req.body;
    if (!code) return res.status(400).json({ error: 'Enter a promo code' });

    const promo = await Promo.findOne({ where: { code: String(code).trim().toUpperCase() } });

    // Compute the order's subtotal + fee the same way checkout does.
    const q = quoteOrder({ category_type, detail });
    const result = evaluatePromo(promo, {
      subtotalUsd:    q.subtotal_usd,
      deliveryFeeUsd: q.delivery_fee_usd,
    });

    if (!result.valid) {
      return res.status(200).json({ valid: false, reason: result.reason });
    }
    return res.status(200).json({
      valid:        true,
      code:         promo.code,
      type:         promo.type,
      discount_usd: result.discount_usd,
      free_delivery: result.freeDelivery,
    });
  } catch (err) {
    console.error('validateCode error:', err.message);
    return res.status(500).json({ error: 'Could not validate code' });
  }
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

// GET /api/promos  (admin)
async function listPromos(req, res) {
  try {
    const promos = await Promo.findAll({ order: [['createdAt', 'DESC']] });
    return res.status(200).json({ promos });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to list promos' });
  }
}

// POST /api/promos  (admin)
async function createPromo(req, res) {
  try {
    const {
      code, type, value, min_order_usd, max_discount_usd,
      usage_limit, expires_at, is_active,
    } = req.body;

    if (!code || !type) return res.status(400).json({ error: 'code and type are required' });
    if (!['percent', 'fixed', 'free_delivery'].includes(type)) {
      return res.status(400).json({ error: 'type must be percent, fixed, or free_delivery' });
    }

    const promo = await Promo.create({
      code:             String(code).trim().toUpperCase(),
      type,
      value:            value || 0,
      min_order_usd:    min_order_usd || 0,
      max_discount_usd: max_discount_usd ?? null,
      usage_limit:      usage_limit ?? null,
      expires_at:       expires_at || null,
      is_active:        is_active !== false,
    });
    return res.status(201).json({ promo });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'That code already exists' });
    }
    console.error('createPromo error:', err.message);
    return res.status(500).json({ error: 'Failed to create promo' });
  }
}

// PATCH /api/promos/:id  (admin)
async function updatePromo(req, res) {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ error: 'Promo not found' });
    const patch = { ...req.body };
    if (patch.code) patch.code = String(patch.code).trim().toUpperCase();
    await promo.update(patch);
    return res.status(200).json({ promo });
  } catch (err) {
    console.error('updatePromo error:', err.message);
    return res.status(500).json({ error: 'Failed to update promo' });
  }
}

// DELETE /api/promos/:id  (admin)
async function deletePromo(req, res) {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) return res.status(404).json({ error: 'Promo not found' });
    await promo.destroy();
    return res.status(200).json({ message: 'Promo deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete promo' });
  }
}

module.exports = { validateCode, listPromos, createPromo, updatePromo, deletePromo };
