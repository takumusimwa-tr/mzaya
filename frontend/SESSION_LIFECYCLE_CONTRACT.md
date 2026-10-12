# Session Lifecycle Contract — Batch 08.7.8

Baseline: `b31667fa04ec1c480e0261c81226ba131a8a689f`

## Invariant

There is one logical authenticated session even though compatibility storage currently uses three
browser keys:

- `mzaya_token`
- `mzaya_user`
- Zustand persisted store `mzaya_auth`

All explicit logout and global HTTP 401 paths must clear all three and clear the in-memory Zustand
session before navigation.

## Why

The API interceptor previously removed only `mzaya_token` and `mzaya_user`. The persisted
`mzaya_auth` store could therefore retain the same stale token/user and rehydrate it on a later app
load. That makes the UI session lifecycle disagree with the API's authentication result.

## Boundary

`useAuthStore` owns session persistence/clearing. The Axios boundary may trigger that contract when
the backend returns 401, but must not maintain a second partial logout implementation.

This batch intentionally does not change token format, backend authorization, refresh-token policy,
cart persistence, finance, database state, providers, or branding.
