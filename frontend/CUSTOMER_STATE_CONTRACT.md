# Customer State Contract — Batch 08.7.9

Baseline: `1923a6cfbd2ce2a146211e9275e283f986b799f0`

Canonical customer pages should use shared loading and recoverable-error primitives rather than
maintaining page-specific implementations.

This batch converges Orders and Saved Addresses onto `components/common/LoadingState.jsx` and
`components/common/ErrorState.jsx`. Orders also gains an explicit query-error branch so a failed
request is not presented as a legitimate empty order history.

Existing empty-state illustrations and page layouts are preserved. This is product-state
architecture consolidation, not branding.

No backend, DB, finance, provider, dependency, route, or persistence changes.
