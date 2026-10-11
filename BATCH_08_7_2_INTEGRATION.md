# Batch 08.7.2 — Profile & Account Contract Consolidation

Baseline: `66e4dc5`

## Why this batch

The routed shared Profile page displays account data but has no persistence path for editing it,
while `pages/customer/EditProfilePage.jsx` is a controlled/presentational page that explicitly
does not persist. The backend exposes GET `/api/auth/me` but no narrow self-service update
contract.

This batch closes that product gap without beginning the final Mzaya branding phase.

## Changes

### Backend
- Adds authenticated `PATCH /api/auth/me`.
- Allows only `name`, `phone`, and `email` through the self-service contract.
- Explicitly does not accept role, verification, password, city or location changes.
- Checks phone/email collisions.
- Normalizes optional email to lowercase.
- Reissues the JWT after update because phone is embedded in the token payload.
- Never returns the password hash.
- Adds focused integration tests for update, collision, privilege-boundary and token behavior.

### Frontend
- Adds `authAPI.updateMe`.
- Adds `updateSession` to the auth store so refreshed user/token state is kept consistent in
  Zustand and the existing localStorage compatibility keys.
- Makes the existing routed Profile page capable of editing name/email/phone.
- Preserves existing role navigation and profile menu behavior.
- Does not adopt the alternate presentational EditProfilePage yet; the routed surface remains
  authoritative until the dedicated visual/branding consolidation.

## Safety
- No database migration.
- No finance/payment/provider changes.
- No role/verification escalation through the new endpoint.
- No password editing through this endpoint.
- No route deletion.
- No branding migration.

## Required gate

Backend:
```powershell
npm test -- --runInBand tests/authProfile.test.js
```

Frontend:
```powershell
npm run build
npm run lint
```

Then review the staged diff before commit.
