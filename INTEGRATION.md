# Mzaya Batch 08.4.3 — Revenue Recognition, Cost Allocation & Profitability

## Database
```bash
psql "$DATABASE_URL" -f backend/migrations/revenue_profitability.sql
```

## Register models
`RevenueRecognitionRule`, `RevenueSchedule`, `RecognizedRevenueEvent`, `OrderEconomics`, `CostAllocationRule`, `CostAllocationRun`, and `ProfitabilitySnapshot`.

## Route mounts
```js
app.use('/api/revenue-recognition', require('./routes/revenueRecognition.routes'));
app.use('/api/cost-allocations', require('./routes/costAllocation.routes'));
app.use('/api/profitability', require('./routes/profitability.routes'));
```

## Recognition policy
Create schedules when payment is captured. Recognize platform, delivery, procurement, commission, or subscription revenue only when the corresponding obligation is satisfied. Refunds and qualifying cancellations must call `reverseRevenue()`.

## Order economics events
Recalculate after order completion, payment capture, vendor settlement, Mzaya payout, refund, chargeback, gateway-fee update, and overhead allocation. Gross order value is not Mzaya revenue.

## Jobs
```js
const { startRevenueRecognitionJob } = require('./jobs/revenueRecognition.job');
const { startProfitabilitySnapshotJob } = require('./jobs/profitabilitySnapshot.job');
startRevenueRecognitionJob({ logger });
startProfitabilitySnapshotJob({ logger });
```

## Frontend
```jsx
<Route path="/admin/finance/revenue-recognition" element={<RevenueRecognitionDashboard />} />
<Route path="/admin/finance/profitability" element={<ProfitabilityDashboard />} />
```

## Controls
Keep taxes separate from revenue unless policy requires otherwise. Preserve schedules and events. Recalculate order economics after every material financial event. Validate recognition policy with qualified accounting professionals before production reporting.

## Verification
```bash
cd backend
npm test -- orderEconomics.test.js
npm test -- costAllocation.test.js
npm test -- revenueRecognition.test.js
node --check src/services/orderEconomics.service.js
node --check src/services/revenueRecognition.service.js
node --check src/services/costAllocation.service.js
node --check src/services/profitability.service.js
npm run lint
```
```bash
cd frontend
npm run lint
npm run build
```
