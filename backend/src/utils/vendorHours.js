/**
 * Backward-compatible adapter.
 * Existing imports continue working while the canonical implementation lives in
 * services/vendorHours.service.js.
 */

const {
  computeIsOpen,
  attachLiveAvailability,
  timePartsAt,
} = require('../services/vendorHours.service');

module.exports = {
  computeIsOpen,
  withLiveOpen: attachLiveAvailability,
  nowInHarare: timePartsAt,
};
