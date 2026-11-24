# Batch 07.7A — Delivery model contracts

Baseline 548c8cc. Copy only packaged files into repository root. No migration or route activation. Do not start development server: src/index.js uses sync({alter:true}) in development and registration changes its schema footprint. Do not run migrations yet. Test only with explicit localhost mzaya_integration_test TEST_DB_URL. Model tests do not query or sync the database. Existing SQL migrations remain unchanged. OTP trust, lifecycle/finance consistency, indexes and backfill validation are deferred to subsequent batches.
