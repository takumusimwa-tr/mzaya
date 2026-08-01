import useFinancialControls from '../../hooks/useFinancialControls'
import '../../components/finance/financialControls.css'

export default function FinancialControlsDashboard() {
  const { policies, approvals, exceptions, loading, decide, resolveException } = useFinancialControls()
  if (loading) return <p className="controls-state">Loading controls…</p>

  return (
    <main className="controls-page">
      <header>
        <p className="finance-eyebrow">Financial governance</p>
        <h1>Controls & approvals</h1>
        <p>Maker-checker approvals, thresholds, and control exceptions.</p>
      </header>

      <section className="controls-grid">
        <div>
          <h2>Pending approvals</h2>
          <div className="controls-list">
            {approvals.map((item) => (
              <article key={item.id}>
                <div><strong>{item.action.replaceAll('_', ' ')}</strong><span>{item.resource_type}</span></div>
                <span>{item.approval_count}/{item.required_approvals}</span>
                <div><button onClick={() => decide(item.id, 'reject')}>Reject</button><button onClick={() => decide(item.id, 'approve')}>Approve</button></div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <h2>Open exceptions</h2>
          <div className="controls-list">
            {exceptions.map((item) => (
              <article key={item.id}>
                <div><strong>{item.summary}</strong><span>{item.severity}</span></div>
                <button onClick={() => { const notes = window.prompt('Resolution notes'); if (notes) resolveException(item.id, notes) }}>Resolve</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Control policies</h2>
        <div className="controls-list">
          {policies.map((item) => (
            <article key={item.id}>
              <div><strong>{item.name}</strong><span>{item.resource_type} · {item.action}</span></div>
              <span>{item.required_approvals} approval(s)</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
