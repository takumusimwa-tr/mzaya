# Payment submission lock and recovery test diagnostics

Replace PaymentPanel.jsx and paymentRecovery.spec.js. A synchronous ref blocks same-tick submissions and remains locked during polling or redirect. Release on initiation error or terminal failed poll. Disable method and phone editing during initiation. Capture request ordinal before awaiting route.fetch, so concurrent requests cannot change fault injection behavior. Preserve all recovery assertions.

Run lint, build, isolated database preflight and targeted paymentRecovery.spec.js before the full suite. Only reset mzaya_integration_test using the existing explicit confirmation. No migrations or dependencies.

Limitations: this is a source-supported race fix, not proof of the exact runtime cause. No automatic polling resume after refresh, gateway reconciliation, or cross-intent charge prevention is introduced. Live validation pending.
