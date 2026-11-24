const { Order, DeliveryProof, OrderTimeline } = require('../src/models/associations');

test('delivery model contracts match migration column types and associations', () => {
  expect(DeliveryProof.getTableName()).toBe('delivery_proofs');
  expect(DeliveryProof.rawAttributes.proof_type.type.toSql()).toBe('VARCHAR(24)');
  expect(DeliveryProof.rawAttributes.createdAt.field).toBe('created_at');
  expect(DeliveryProof.rawAttributes.order_id.unique).toBe(true);
  expect(OrderTimeline.getTableName()).toBe('order_timelines');
  expect(OrderTimeline.rawAttributes.to_status.type.toSql()).toBe('VARCHAR(50)');
  expect(OrderTimeline.rawAttributes.actor_role.type.toSql()).toBe('VARCHAR(30)');
  expect(OrderTimeline.rawAttributes.updatedAt).toBeUndefined();
  expect(Order.associations.deliveryProof.target).toBe(DeliveryProof);
  expect(Order.associations.timeline.target).toBe(OrderTimeline);
});

test('unsupported proof type fails local validation', async () => {
  const proof = DeliveryProof.build({ order_id: '11111111-1111-4111-8111-111111111111', rider_id: '22222222-2222-4222-8222-222222222222', proof_type: 'unsupported' });
  await expect(proof.validate()).rejects.toThrow(/proof_type/);
});
