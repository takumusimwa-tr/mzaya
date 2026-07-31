import useReconciliationExceptions from '../../hooks/useReconciliationExceptions'
import './finance.css'

export default function ReconciliationExceptions() {
  const {
    records,
    loading,
    refresh,
  } = useReconciliationExceptions()

  if (loading) {
    return <p className="finance-state">Loading reconciliation records…</p>
  }

  return (
    <section className="reconciliation-exceptions">
      <header>
        <div>
          <p className="finance-eyebrow">Finance operations</p>
          <h1>Reconciliation exceptions</h1>
        </div>

        <button type="button" onClick={refresh}>
          Refresh
        </button>
      </header>

      {!records.length ? (
        <div className="finance-empty">
          <h2>Everything matches</h2>
          <p>No provider discrepancies require review.</p>
        </div>
      ) : (
        <div className="reconciliation-exceptions__list">
          {records.map((record) => (
            <article key={record.id}>
              <div>
                <strong>{record.provider_reference}</strong>
                <span>
                  {record.provider} · {record.record_type}
                </span>
              </div>

              <div>
                <span>Provider</span>
                <strong>
                  {record.currency}{' '}
                  {(Number(record.provider_amount_minor) / 100).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{record.reconciliation_status}</strong>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
