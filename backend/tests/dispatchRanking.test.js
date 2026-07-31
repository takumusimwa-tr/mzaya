const {
  rankCandidates,
} = require('../src/services/dispatchRanking.service');

const order = {
  pickup_location: { lat: -17.8252, lng: 31.0335 },
  dropoff_location: { lat: -17.8000, lng: 31.0500 },
};

describe('dispatch ranking', () => {
  test('prefers a nearby Mzaya with lower workload', () => {
    const candidates = [
      {
        userId: 'far',
        activeCount: 1,
        rider: {
          current_location: { lat: -17.7000, lng: 31.1500 },
        },
      },
      {
        userId: 'near',
        activeCount: 0,
        rider: {
          current_location: { lat: -17.8240, lng: 31.0340 },
        },
      },
    ];

    const ranked = rankCandidates({ candidates, order });
    expect(ranked[0].userId).toBe('near');
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  test('excludes candidates without valid locations', () => {
    const ranked = rankCandidates({
      candidates: [{
        userId: 'invalid',
        activeCount: 0,
        rider: { current_location: null },
      }],
      order,
    });
    expect(ranked).toEqual([]);
  });
});
