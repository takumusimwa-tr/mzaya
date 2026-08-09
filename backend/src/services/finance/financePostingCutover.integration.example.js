/**
 * Recommended operational migration pattern.
 *
 * During SHADOW mode:
 *   - existing operational behavior remains authoritative
 *   - finance event path runs and reconciles
 *   - compare results, but do not disable legacy posting yet
 *
 * During BLOCK_LEGACY mode:
 *   - direct ledger writes fail through financeLegacyPostingGuard
 *   - finance event engine becomes the only accounting entry route
 */
function shouldUseEventEngine(control) {
  return ['shadow', 'event_engine', 'block_legacy']
    .includes(control?.current_mode);
}

function shouldBlockLegacy(control) {
  return ['event_engine', 'block_legacy']
    .includes(control?.current_mode);
}

module.exports = {
  shouldUseEventEngine,
  shouldBlockLegacy,
};
