/**
 * ============================================================================
 * MZAYA
 * Module: Vendor Validation
 * Path: backend/src/validators/vendor.validator.js
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Defines the canonical server-side validation contracts for vendor onboarding,
 * branch creation, profile updates and menu mutations.
 *
 * Responsibilities
 * ----------------
 * • Reject malformed or unsafe payloads before they reach Sequelize.
 * • Normalize strings by trimming surrounding whitespace.
 * • Keep owner-editable and administrator-editable fields explicit.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not authorize ownership.
 * • Does not query the database.
 * • Does not decide whether a branch should be approved.
 *
 * Security Notes
 * --------------
 * Validation is enforced on the backend even when the frontend already validates.
 * Browser validation is convenience only and must never be treated as a boundary.
 *
 * Dependencies
 * ------------
 * Joi, already present in backend/package.json.
 *
 * Change Log
 * ----------
 * July 2026 — Initial canonical validation layer.
 * ============================================================================
 */

const Joi = require('joi');

const CATEGORY_VALUES = ['food', 'grocery', 'materials'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const optionalText = (max) =>
  Joi.string().trim().max(max).allow('', null);

const requiredText = (max) =>
  Joi.string().trim().min(1).max(max).required();

const imageUrl = Joi.string()
  .trim()
  .max(2048)
  .uri({ scheme: ['http', 'https'] })
  .allow('', null);

const dayHours = Joi.object({
  open: Joi.string().pattern(TIME_PATTERN).required(),
  close: Joi.string().pattern(TIME_PATTERN).required(),
  closed: Joi.boolean().required(),
}).unknown(false);

const openingHours = Joi.object(
  Object.fromEntries(DAY_KEYS.map((day) => [day, dayHours]))
).unknown(false);

const createVendorSchema = Joi.object({
  name: requiredText(120),
  category: Joi.string().valid(...CATEGORY_VALUES).required(),
  phone: requiredText(40),
  address: requiredText(255),
  city_id: Joi.string().uuid().required(),
  description: optionalText(2000),
  branch_name: optionalText(120).default('Main'),
}).unknown(false);

const addBranchSchema = Joi.object({
  branch_name: requiredText(120),
  city_id: Joi.string().uuid().required(),
  address: requiredText(255),
  phone: requiredText(40),
}).unknown(false);

const ownerVendorUpdateSchema = Joi.object({
  name: requiredText(120),
  description: optionalText(2000),
  category: Joi.string().valid(...CATEGORY_VALUES),
  phone: requiredText(40),
  address: requiredText(255),
  city_id: Joi.string().uuid(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).unknown(false).allow(null),
  opening_hours: openingHours.allow(null),
  is_paused: Joi.boolean(),
  logo_url: imageUrl,
  cover_url: imageUrl,
}).min(1).unknown(false);

const adminVendorUpdateSchema = ownerVendorUpdateSchema.keys({
  is_active: Joi.boolean(),
});

const createMenuItemSchema = Joi.object({
  name: requiredText(160),
  description: optionalText(2000),
  price_usd: Joi.number().precision(2).min(0).max(99999999.99).required(),
  category: optionalText(120),
  prep_minutes: Joi.number().integer().min(0).max(1440).default(0),
  weight_kg: Joi.number().precision(2).min(0).max(999999.99).default(0),
  image_url: imageUrl,
}).unknown(false);

const updateMenuItemSchema = Joi.object({
  name: requiredText(160),
  description: optionalText(2000),
  price_usd: Joi.number().precision(2).min(0).max(99999999.99),
  category: optionalText(120),
  prep_minutes: Joi.number().integer().min(0).max(1440),
  weight_kg: Joi.number().precision(2).min(0).max(999999.99),
  image_url: imageUrl,
  is_available: Joi.boolean(),
}).min(1).unknown(false);

function validate(schema, payload) {
  return schema.validate(payload, {
    abortEarly: false,
    convert: true,
    stripUnknown: false,
  });
}

module.exports = {
  CATEGORY_VALUES,
  validate,
  createVendorSchema,
  addBranchSchema,
  ownerVendorUpdateSchema,
  adminVendorUpdateSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
};
