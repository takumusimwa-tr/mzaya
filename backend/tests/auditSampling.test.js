const {
  selectSystematicSample,
} = require('../src/services/financeAuditSampling.service');

describe('finance audit sampling', () => {
  test('returns requested sample count', () => {
    const population = Array.from({ length: 100 }, (_, index) => index + 1);
    expect(selectSystematicSample({
      population,
      sampleSize: 10,
      seed: 3,
    })).toHaveLength(10);
  });

  test('never exceeds population size', () => {
    expect(selectSystematicSample({
      population: [1, 2, 3],
      sampleSize: 20,
    })).toHaveLength(3);
  });
});
