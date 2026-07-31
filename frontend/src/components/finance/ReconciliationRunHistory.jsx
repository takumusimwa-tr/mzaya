import useReconciliationRuns from '../../hooks/useReconciliationRuns'

export default function ReconciliationRunHistory() {
  const {
    runs,
    loading,
  } = useReconciliationRuns()

  if (loading) {
    return <p className="provider-webhook-state">Loading reconciliation runs…</p>
  }

  return (
    <section className="reconciliation-run-history">
      <header>
        <p className="finance-eyebrow">Automation</p>
        <h2>Reconciliation runs</h2>
      </header>

      {!runs.length ? (
        <div className="provider-webhook-empty">
          <h3>No reconciliation runs</h3>
          <p>Automated statement processing will appear here.</p>
        </div>
      ) : (
        runs.map((run) => (
          <article key={run.id}>
            <div>
              <strong>{run.run_reference}</strong>
              <span>{run.provider} · {run.statement_date || 'Ad hoc'}</span>
            </div>
            <div>
              <span>Matched</span>
              <strong>{run.matched_count}</strong>
            </div>
            <div>
              <span>Exceptions</span>
              <strong>
                {Number(run.unmatched_count) + Number(run.discrepancy_count)}
              </strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{run.status}</strong>
            </div>
          </article>
        ))
      )}
    </section>
  )
}
