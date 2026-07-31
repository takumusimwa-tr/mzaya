function normalizeWaveform(samples, points = 80) {
  if (!Array.isArray(samples) || !samples.length) return [];

  const blockSize = Math.max(1, Math.floor(samples.length / points));
  const result = [];

  for (let index = 0; index < samples.length; index += blockSize) {
    const block = samples.slice(index, index + blockSize);
    const peak = Math.max(...block.map((value) => Math.abs(Number(value) || 0)));
    result.push(Number(Math.min(1, peak).toFixed(3)));
  }

  return result.slice(0, points);
}

function validateDuration(durationMs) {
  const duration = Number(durationMs);
  if (!Number.isFinite(duration) || duration < 300 || duration > 10 * 60 * 1000) {
    const error = new Error('Voice note duration must be between 0.3 and 600 seconds');
    error.status = 400;
    error.code = 'INVALID_VOICE_DURATION';
    throw error;
  }
  return duration;
}

module.exports = {
  normalizeWaveform,
  validateDuration,
};
