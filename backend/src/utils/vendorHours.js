// backend/src/utils/vendorHours.js
// Computes whether a vendor is open right now, from opening_hours + pause state.
// Open = current Zimbabwe time falls within today's hours AND not manually paused.


// Current time in Africa/Harare as { day: 'mon'|..., minutes: number-since-midnight }
function nowInHarare() {
  // en-GB gives 24h HH:MM; weekday short gives Mon/Tue/...
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Harare',
    hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  });
  const parts = fmt.formatToParts(new Date());
  let hh = 0, mm = 0, wd = '';
  for (const p of parts) {
    if (p.type === 'hour') hh = parseInt(p.value, 10);
    if (p.type === 'minute') mm = parseInt(p.value, 10);
    if (p.type === 'weekday') wd = p.value.toLowerCase().slice(0, 3);
  }
  return { day: wd, minutes: hh * 60 + mm };
}

function toMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return null;
  const [h, m] = hhmm.split(':').map((x) => parseInt(x, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// Given a vendor's opening_hours JSONB and is_paused flag, is it open now?
// opening_hours shape: { mon: { open:'08:00', close:'22:00', closed:false }, ... }
function computeIsOpen(openingHours, isPaused) {
  if (isPaused) return false;              // manual override wins
  if (!openingHours) return true;          // no hours set → treat as always available

  const { day, minutes } = nowInHarare();
  const today = openingHours[day];
  if (!today || today.closed) return false;

  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (open == null || close == null) return true; // malformed → don't block

  // Handle normal ranges and overnight ranges (e.g. 18:00–02:00).
  if (close > open) {
    return minutes >= open && minutes < close;
  }
  return minutes >= open || minutes < close;
}

// Attach a live is_open to a plain vendor object (mutates a copy).
function withLiveOpen(vendorJson) {
  if (!vendorJson) return vendorJson;
  return {
    ...vendorJson,
    is_open: computeIsOpen(vendorJson.opening_hours, vendorJson.is_paused),
  };
}

module.exports = { computeIsOpen, withLiveOpen, nowInHarare };
