const EARTH_RADIUS_KM = 6371;

function validCoordinate(point) {
  return Boolean(
    point &&
      Number.isFinite(Number(point.lat)) &&
      Number.isFinite(Number(point.lng)) &&
      Number(point.lat) >= -90 &&
      Number(point.lat) <= 90 &&
      Number(point.lng) >= -180 &&
      Number(point.lng) <= 180
  );
}

function toRadians(value) {
  return (Number(value) * Math.PI) / 180;
}

function distanceKm(from, to) {
  if (!validCoordinate(from) || !validCoordinate(to)) return null;

  const latDelta = toRadians(Number(to.lat) - Number(from.lat));
  const lngDelta = toRadians(Number(to.lng) - Number(from.lng));
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) *
      Math.cos(toLat) *
      Math.sin(lngDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine)
  );
}

module.exports = { distanceKm, validCoordinate };
