INSERT INTO riders (id, user_id, city_id, vehicle_type, is_online, is_approved, total_deliveries, total_earnings_usd, rating, "createdAt", "updatedAt")
SELECT gen_random_uuid(), u.id, 'd7e5b342-5ee8-4e40-9c1f-1024ec0007a2', 'bike', false, true, 0, 0, 0, NOW(), NOW()
FROM users u
WHERE u.phone = '0772000001';
