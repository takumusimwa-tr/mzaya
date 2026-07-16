# Security Notes

## Accepted dependency advisories

Run `npm audit` in `backend/` and you will see **2 moderate** advisories. They are
accepted, deliberately. **Do not run `npm audit fix --force`.**

### `uuid < 11.1.1` — moderate — GHSA-w5hq-g745-h8pq

> Missing buffer bounds check in v3/v5/v6 when `buf` is provided

**Status: accepted. Not reachable.**

Two reasons:

1. **The vulnerable code path doesn't exist in this app.** The advisory concerns
   uuid's **v3/v5/v6** algorithms *when an explicit output buffer is passed*. We
   use `DataTypes.UUIDV4` throughout, and Sequelize never passes a `buf`. There is
   no way to reach the vulnerable branch from Mzaya.

2. **The proposed "fix" is far worse than the bug.** npm resolves this by
   downgrading **Sequelize v6 → v3** — a decade-old major release. That would
   destroy the entire data layer: every model, every association, every query.
   npm's solver is being literal, not sensible.

`uuid` arrives transitively through Sequelize. The right move is to let Sequelize
bump it on their own schedule, and re-check on each upgrade.

**Re-evaluate when:** Sequelize releases a version depending on `uuid >= 11.1.1`.

---

## Fixed (2026-07)

These were real, and two of them sat directly on the payment path:

| Package | Severity | Why it mattered |
|---|---|---|
| `axios` | HIGH | Authentication bypass via prototype pollution. The payment service calls Paynow over axios. → upgraded to `^1.18.1` |
| `follow-redirects` | MODERATE | **Leaked Authorization headers to third parties on redirect.** Paynow's card flow *is* a redirect flow — this was a credential leak on the exact code path that moves money. Transitive via axios; fixed by the upgrade. |
| `form-data` | HIGH | CRLF injection. Used by axios for the form-encoded Paynow requests. Fixed by the upgrade. |
| `vite` | HIGH | NTLMv2 hash disclosure via UNC path — Windows-specific, so live on the dev machine. (frontend) |
| `joi`, `qs`, `brace-expansion` | MODERATE | DoS / parsing issues. Cleared by `npm audit fix`. |

**Frontend is now at 0 vulnerabilities.**

---

## Rule of thumb

Before running `npm audit fix --force`, read what it plans to install. A "fix" that
downgrades a core dependency by three majors is not a fix — it's an outage with a
green checkmark.
