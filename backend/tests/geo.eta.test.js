const { distanceKm } = require('../src/utils/geo');
const { estimateOrderETA, travelMinutes } = require('../src/services/eta.service');

describe('geo utilities', () => {
  test('returns zero for identical points', () => {
    expect(distanceKm({ lat: -17.8252, lng: 31.0335 }, {
      lat: -17.8252,
      lng: 31.0335,
    })).toBeCloseTo(0, 6);
  });

  test('returns null for invalid coordinates', () => {
    expect(distanceKm(null, { lat: 1, lng: 2 })).toBeNull();
  });
});

describe('ETA service', () => {
  test('creates pickup, delivery and total estimates', () => {
    const eta = estimateOrderETA({
      riderLocation: { lat: -17.8252, lng: 31.0335 },
      pickupLocation: { lat: -17.8100, lng: 31.0400 },
      dropoffLocation: { lat: -17.7800, lng: 31.0600 },
    });

    expect(eta.pickupDistanceKm).toBeGreaterThan(0);
    expect(eta.deliveryDistanceKm).toBeGreaterThan(0);
    expect(eta.totalEtaMinutes).toBeGreaterThan(eta.pickupEtaMinutes);
  });

  test('enforces a minimum travel time', () => {
    expect(travelMinutes(0)).toBe(1);
  });
});
