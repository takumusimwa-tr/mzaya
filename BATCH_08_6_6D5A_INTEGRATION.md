# Batch 08.6.6D.5A

Supersedes the D.5 repair migration before D.5 was ever applied.

The previous draft attempted to create `treasury_transfers.fx_rate_id` before
`treasury_fx_rates` existed. This corrected phase-1 repair deliberately omits
that FK. It aligns the verified-empty legacy table with all prerequisites that
already exist. After this repair is applied, `treasury_fx_cash_pooling.sql`
must be re-probed. If the only remaining drift is `fx_rate_id`, a phase-2
repair will add that FK after `treasury_fx_rates` exists.

No provider call or money movement is performed.
