import useConsolidation from '../../hooks/useConsolidation'
import EntityTree from '../../components/finance/EntityTree'
import ConsolidationStatus from '../../components/finance/ConsolidationStatus'
import '../../components/finance/consolidation.css'

export default function ConsolidationDashboard() {
  const {
    groups,
    runs,
    loading,
  } = useConsolidation()

  if (loading) {
    return <p className="consolidation-state">Loading consolidation…</p>
  }

  return (
    <main className="consolidation-page">
      <header>
        <p className="finance-eyebrow">Group finance</p>
        <h1>Consolidation</h1>
        <p>
          Legal entities, ownership structures, eliminations, and group reporting.
        </p>
      </header>

      <section className="consolidation-grid">
        <div>
          <h2>Group structure</h2>
          {groups.map((group) => (
            <section key={group.id} className="consolidation-group-card">
              <strong>{group.name}</strong>
              <EntityTree members={group.members || []} />
            </section>
          ))}
        </div>

        <div>
          <h2>Consolidation runs</h2>
          <ConsolidationStatus runs={runs} />
        </div>
      </section>
    </main>
  )
}
