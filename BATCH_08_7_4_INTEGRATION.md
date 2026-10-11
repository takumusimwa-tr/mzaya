# Batch 08.7.4 — Notification Center Product Activation

Baseline: `7beb426`

The backend already exposes authenticated notification list, unread-count, read, read-all and archive
operations, while the frontend already has a realtime-aware `useNotifications` hook. The routed
Profile page nevertheless labels Notifications as "Coming soon" with a no-op action.

This batch closes that product gap without creating a second notification system.

## Scope
- Adds authenticated `/notifications`.
- Connects Profile -> Notifications and removes the stale "Coming soon" badge.
- Reuses `useNotifications` for initial fetch, cursor pagination, realtime updates, mark-read,
  mark-all-read and archive.
- Supports existing `action_url` deep links.
- Adds loading, empty and recoverable error states.
- No backend, database, finance or provider changes.
- No final branding migration.

## Apply
```powershell
node scripts/apply-batch-08-7-4.js
Remove-Item scripts/apply-batch-08-7-4.js
```

## Gate
```powershell
cd frontend
npm run build
npm run lint
cd ..
git diff --check
git status --short
git diff --stat
```
