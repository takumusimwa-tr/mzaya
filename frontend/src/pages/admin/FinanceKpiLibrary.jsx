import useFinanceKpis from '../../hooks/useFinanceKpis'
import '../../components/finance/executiveFinance.css'

export default function FinanceKpiLibrary() {
  const {
    definitions,
    loading,
  } = useFinanceKpis()

  if (loading) {
    return <p className="executive-finance-state">Loading KPI library…</p>
  }

  return (
    <main className="executive-finance-page">
      <header>
        <div>
          <p className="finance-eyebrow">KPI governance</p>
          <h1>Finance KPI library</h1>
          <p>Definitions, owners, sources, thresholds, and formula versions.</p>
        </div>
      </header>

      <section className="finance-kpi-library">
        {definitions.map((definition) => (
          <article key={definition.id}>
            <div>
              <strong>{definition.name}</strong>
              <span>{definition.category}</span>
            </div>
            <span>v{definition.formula_version}</span>
            <span>{definition.unit}</span>
            <span>{definition.status}</span>
          </article>
        ))}
      </section>
    </main>
  )
}
