import useIntercompany from '../../hooks/useIntercompany'
import IntercompanyTable from '../../components/finance/IntercompanyTable'
import '../../components/finance/consolidation.css'

export default function IntercompanyDashboard() {
  const {
    transactions,
    loading,
  } = useIntercompany()

  if (loading) {
    return <p className="consolidation-state">Loading intercompany activity…</p>
  }

  return (
    <main className="consolidation-page">
      <header>
        <p className="finance-eyebrow">Group finance</p>
        <h1>Intercompany</h1>
        <p>Cross-entity balances, matching, and elimination readiness.</p>
      </header>

      <IntercompanyTable transactions={transactions} />
    </main>
  )
}
