// backend/src/utils/pinParser.js
// Extracts { lat, lng } from pasted Google Maps / WhatsApp location strings.
// Handles the coordinate-bearing formats directly; short links (goo.gl) must be
// resolved via a redirect follow first (see geo.controller.resolvePin).

// Valid Zimbabwe-ish bounds sanity check (rough) so we reject garbage.
// ZW spans about lat -22.5..-15.5, lng 25..33.5. We allow a generous margin.
function looksLikeZimCoords(lat, lng) {
  return lat >= -23 && lat <= -15 && lng >= 24 && lng <= 34;
}

// Try to pull coordinates out of a URL or raw string.
// Returns { lat, lng } or null.
function extractCoords(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();

  // Ordered list of patterns to try. Each capture group 1 = lat, 2 = lng.
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,                 // .../@-17.8252,31.0335,17z
    /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,          // ?q=-17.8252,31.0335
    /[?&]query=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,      // ?query=-17.8252,31.0335
    /[?&]ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,         // ?ll=-17.8252,31.0335
    /[?&]destination=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,// ?destination=...
    /\/(-?\d+\.\d+),(-?\d+\.\d+)/,                 // /-17.8252,31.0335
    /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/,              // bare "-17.8252, 31.0335"
  ];

  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        return { lat, lng };
      }
    }
  }
  return null;
}

// Is this a shortened link that needs a redirect follow to reveal coords?
function isShortLink(input) {
  if (!input || typeof input !== 'string') return false;
  return /(maps\.app\.goo\.gl|goo\.gl\/maps|g\.co\/kgs)/i.test(input);
}

module.exports = { extractCoords, isShortLink, looksLikeZimCoords };
