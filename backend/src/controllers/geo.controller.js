// backend/src/controllers/geo.controller.js
const axios = require('axios');
const { extractCoords, isShortLink, looksLikeZimCoords } = require('../utils/pinParser');

// POST /api/geo/resolve-pin  { link: "<pasted whatsapp/maps link>" }
// Returns { lat, lng, source } or 422 if it can't extract coordinates.
async function resolvePin(req, res) {
  try {
    const { link } = req.body;
    if (!link || typeof link !== 'string') {
      return res.status(400).json({ error: 'A location link is required' });
    }

    // 1. Try to read coordinates straight from the pasted string.
    let coords = extractCoords(link);
    if (coords) {
      return res.status(200).json({ ...coords, source: 'direct', warn: outOfBoundsWarn(coords) });
    }

    // 2. If it's a short link, follow redirects to reveal the real URL.
    if (isShortLink(link)) {
      try {
        // maxRedirects lets axios chase the goo.gl → maps.google chain.
        // We only need the final URL, not the page body.
        const resp = await axios.get(link, {
          maxRedirects: 5,
          timeout: 6000,
          // Some short links resolve via a 302 to a long maps URL; axios exposes
          // the final URL on the request. Also parse any coords in the body.
          validateStatus: (s) => s >= 200 && s < 400,
        });

        const finalUrl = resp.request?.res?.responseUrl || resp.request?.responseURL || '';
        coords = extractCoords(finalUrl) || extractCoords(typeof resp.data === 'string' ? resp.data : '');

        if (coords) {
          return res.status(200).json({ ...coords, source: 'resolved', warn: outOfBoundsWarn(coords) });
        }
      } catch (e) {
        // fall through to the 422 below
      }
    }

    return res.status(422).json({
      error: "Couldn't read a location from that link. Paste the Google Maps link from the WhatsApp pin, or type the address instead.",
    });
  } catch (err) {
    console.error('resolvePin error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve location' });
  }
}

function outOfBoundsWarn(coords) {
  return looksLikeZimCoords(coords.lat, coords.lng)
    ? null
    : 'This pin looks like it may be outside Zimbabwe — double-check it.';
}

module.exports = { resolvePin };
