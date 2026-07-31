const { distanceKm } = require('../utils/geo');
const { estimateOrderETA } = require('./eta.service');

function normalize(value, maximum) {
  return Math.min(Math.max(Number(value) / maximum, 0), 1);
}

function rankCandidate({ candidate, order, recentAssignments = 0 }) {
  const riderLocation = candidate.rider.current_location;
  const pickupDistanceKm = distanceKm(
    riderLocation,
    order.pickup_location
  );

  if (pickupDistanceKm == null) return null;

  const eta = estimateOrderETA({
    riderLocation,
    pickupLocation: order.pickup_location,
    dropoffLocation: order.dropoff_location,
  });

  const distancePenalty = normalize(pickupDistanceKm, 25) * 0.60;
  const workloadPenalty = normalize(candidate.activeCount, 3) * 0.25;
  const fairnessPenalty = normalize(recentAssignments, 10) * 0.15;
  const score = 1 - distancePenalty - workloadPenalty - fairnessPenalty;

  return {
    ...candidate,
    score: Number(score.toFixed(6)),
    distanceKm: Number(pickupDistanceKm.toFixed(3)),
    eta,
  };
}

function rankCandidates({ candidates, order, recentAssignmentCounts = new Map() }) {
  return candidates
    .map((candidate) =>
      rankCandidate({
        candidate,
        order,
        recentAssignments:
          recentAssignmentCounts.get(String(candidate.userId)) || 0,
      })
    )
    .filter(Boolean)
    .sort((a, b) =>
      b.score - a.score || a.distanceKm - b.distanceKm
    );
}

module.exports = { rankCandidate, rankCandidates };
