import useDisputes from '../../hooks/useDisputes'
import './refunds.css'

export default function DisputesDashboard() {
  const {
    disputes,
    loading,
    update,
  } = useDisputes()

  if (loading) {
    return <p className="finance-state">Loading disputes…</p>
  }

  return (
    <section className="disputes-dashboard">
      <header>
        <p>Finance operations</p>
        <h1>Customer disputes</h1>
      </header>

      {!disputes.length ? (
        <div className="finance-empty">
          <h2>No active disputes</h2>
          <p>Customer cases will appear here.</p>
        </div>
      ) : (
        disputes.map((dispute) => (
          <article key={dispute.id}>
            <div>
              <strong>{dispute.subject}</strong>
              <span>{dispute.category} · {dispute.priority}</span>
            </div>

            <div>
              <span>{dispute.status.replaceAll('_', ' ')}</span>
              <button
                type="button"
                onClick={() => update(dispute.id, {
                  status: 'under_review',
                })}
              >
                Start review
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  )
}
