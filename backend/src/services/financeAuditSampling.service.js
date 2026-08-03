function selectSystematicSample({
  population,
  sampleSize,
  seed = 0,
}) {
  if (!Array.isArray(population)) {
    throw new TypeError('Population must be an array');
  }

  const size = Math.min(Math.max(Number(sampleSize) || 0, 0), population.length);
  if (size === 0) return [];

  const interval = population.length / size;
  const start = Math.abs(Number(seed) || 0) % Math.max(1, Math.floor(interval));

  return Array.from({ length: size }, (_, index) => {
    const position = Math.min(
      population.length - 1,
      Math.floor(start + index * interval)
    );
    return population[position];
  });
}

module.exports = { selectSystematicSample };
