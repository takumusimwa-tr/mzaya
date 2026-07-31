const { Op, fn, col } = require('sequelize');
const { Rider, User, Order, City } = require('../models/associations');

const ACTIVE_ORDER_STATUSES = [
  'accepted',
  'rider_assigned',
  'picked_up',
  'en_route',
];

function locationIsFresh(location) {
  const timestamp = location?.updated_at || location?.recordedAt;
  if (!timestamp) return false;

  const maximumAgeMs = Number(
    process.env.RIDER_LOCATION_MAX_AGE_MS || 5 * 60 * 1000
  );
  return Date.now() - new Date(timestamp).getTime() <= maximumAgeMs;
}

async function resolveOrderCityId(order) {
  if (order.city_id) return order.city_id;
  if (!order.city) return null;

  const city = await City.findOne({
    where: {
      [Op.or]: [
        { id: order.city },
        { name: { [Op.iLike]: order.city } },
      ],
    },
    attributes: ['id'],
    raw: true,
  });

  return city?.id || null;
}

async function findAvailableRiders(order, options = {}) {
  const cityId = await resolveOrderCityId(order);
  if (!cityId) return [];

  const capacity = Number(options.capacity || process.env.RIDER_ORDER_CAPACITY || 1);

  const riders = await Rider.findAll({
    where: {
      city_id: cityId,
      is_online: true,
      is_approved: true,
      current_location: { [Op.ne]: null },
    },
    include: [{
      model: User,
      as: 'user',
      attributes: ['id', 'first_name', 'last_name'],
      required: true,
    }],
  });

  const userIds = riders.map((rider) => rider.user_id);
  if (!userIds.length) return [];

  const workloads = await Order.findAll({
    where: {
      rider_id: { [Op.in]: userIds },
      status: { [Op.in]: ACTIVE_ORDER_STATUSES },
    },
    attributes: [
      'rider_id',
      [fn('COUNT', col('id')), 'active_count'],
    ],
    group: ['rider_id'],
    raw: true,
  });

  const workloadByRider = new Map(
    workloads.map((row) => [String(row.rider_id), Number(row.active_count)])
  );

  return riders
    .map((rider) => ({
      rider,
      userId: rider.user_id,
      activeCount: workloadByRider.get(String(rider.user_id)) || 0,
    }))
    .filter(({ rider, activeCount }) =>
      activeCount < capacity && locationIsFresh(rider.current_location)
    );
}

module.exports = {
  ACTIVE_ORDER_STATUSES,
  findAvailableRiders,
  locationIsFresh,
  resolveOrderCityId,
};
