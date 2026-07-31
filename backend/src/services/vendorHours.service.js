/**
 * ============================================================================
 * MZAYA
 * Service: Vendor Hours
 * Path: backend/src/services/vendorHours.service.js
 * ----------------------------------------------------------------------------
 * Canonical source of truth for live branch availability in Zimbabwe time.
 * Keeps time calculations outside controllers so customer, vendor and dispatch
 * flows evaluate operating hours consistently.
 * ============================================================================
 */

const HARARE_TIME_ZONE = 'Africa/Harare';

function timePartsAt(date = new Date(), timeZone = HARARE_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    day: String(parts.weekday || '').toLowerCase().slice(0, 3),
    minutes: Number(parts.hour || 0) * 60 + Number(parts.minute || 0),
  };
}

function toMinutes(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function isWithinWindow(current, open, close) {
  if (open === close) return true;
  if (close > open) return current >= open && current < close;
  return current >= open || current < close;
}

function computeIsOpen(openingHours, isPaused, date = new Date()) {
  if (isPaused) return false;
  if (!openingHours) return true;

  const { day, minutes } = timePartsAt(date);
  const schedule = openingHours[day];

  if (!schedule || schedule.closed) return false;

  const open = toMinutes(schedule.open);
  const close = toMinutes(schedule.close);

  // Preserve legacy fail-open behavior for malformed historical records.
  if (open === null || close === null) return true;

  return isWithinWindow(minutes, open, close);
}

function attachLiveAvailability(vendorJson, date = new Date()) {
  if (!vendorJson) return vendorJson;

  return {
    ...vendorJson,
    is_open: computeIsOpen(
      vendorJson.opening_hours,
      vendorJson.is_paused,
      date
    ),
  };
}

module.exports = {
  HARARE_TIME_ZONE,
  timePartsAt,
  toMinutes,
  isWithinWindow,
  computeIsOpen,
  attachLiveAvailability,
};
