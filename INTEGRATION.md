# Mzaya Batch 04 — Vendor and Admin Advertising UI

This is a local overlay patch; **not** a complete repository.

## Files (8)
- backend/src/controllers/adCampaign.controller.js (replace Batch 03 version)
- backend/src/routes/adCampaign.routes.js (replace Batch 03 version)
- frontend/src/api/api.js (replace Batch 03 version)
- frontend/src/App.jsx (replace existing)
- frontend/src/components/layout/VendorSideRail.jsx (replace existing)
- frontend/src/pages/vendor/VendorCampaigns.jsx (new)
- frontend/src/pages/admin/AdminCampaigns.jsx (new)
- frontend/src/pages/admin/AdminHome.jsx (replace existing)

## Scope
Vendor can create draft campaigns for brands they own and submit for review. Admin can review and change status. Customer discovery continues to use approved campaigns only. No billing, image upload, or vendor editing is included. Vendor category and city must correspond to an eligible active branch.

## Important
- Built from the latest uploaded local ZIP plus Batch 03 API/backend changes; your local changes after that ZIP may differ. Back up files and compare before replacement.
- No new database migration.
- The original 20261114_ad_campaigns.sql remains pending; do not execute or baseline it as part of this batch.
- Run frontend build and lint, backend syntax checks and authenticated role-based smoke tests. No live DB or browser integration test was run here.
