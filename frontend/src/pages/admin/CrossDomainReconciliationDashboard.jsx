import useCrossDomainReconciliation from '../../hooks/useCrossDomainReconciliation'
import ReconciliationHealthGrid from '../../components/finance/ReconciliationHealthGrid'
import CrossDomainExceptionTable from '../../components/finance/CrossDomainExceptionTable'
import '../../components/finance/financeCutover.css'

export default function CrossDomainReconciliationDashboard() {
  const {
    runs,
    exceptions,
    snapshots,
    loading,
    run,
  } = useCrossDomainReconciliation()

  if (loading) {
    return <p className="finance-cutover-state">Loading finance reconciliation…</p>
  }

  return (
    <main className="finance-cutover-page">
      <header>
        <div>
          <p className="finance-eyebrow">Finance migration</p>
          <h1>Cross-domain reconciliation</h1>
          <p>
            Payment, order, vendor, Mzaya, procurement, treasury, and tax accounting health.
          </p>
        </div>

        <button
          className="finance-cutover-primary"
          type="button"
          onClick={run}
        >
          Run reconciliation
        </button>
      </header>

      <ReconciliationHealthGrid snapshots={snapshots} />

      <section className="cross-domain-run-summary">
        <article>
          <span>Latest run</span>
          <strong>{runs[0]?.run_reference || '—'}</strong>
        </article>
        <article>
          <span>Blocking exceptions</span>
          <strong>{runs[0]?.blocking_exception_count || 0}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>{runs[0]?.status || '—'}</strong>
        </article>
      </section>

      <h2>Exceptions</h2>
      <CrossDomainExceptionTable exceptions={exceptions} />
    </main>
  )
}
