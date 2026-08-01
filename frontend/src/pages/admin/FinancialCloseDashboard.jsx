import useFinancialClose from '../../hooks/useFinancialClose'
import CloseCycleCard from '../../components/finance/CloseCycleCard'
import '../../components/finance/financialClose.css'

export default function FinancialCloseDashboard() {
  const {
    cycles,
    loading,
    completeTask,
    generateTrialBalance,
    completeClose,
  } = useFinancialClose()

  if (loading) {
    return <p className="financial-close-state">Loading financial close…</p>
  }

  return (
    <main className="financial-close-page">
      <header>
        <p className="finance-eyebrow">Accounting operations</p>
        <h1>Financial close</h1>
        <p>
          Period checklists, trial balances, statement readiness, and sign-off.
        </p>
      </header>

      <section className="financial-close-grid">
        {cycles.map((cycle) => (
          <CloseCycleCard
            key={cycle.id}
            cycle={cycle}
            onCompleteTask={completeTask}
            onGenerateTrialBalance={generateTrialBalance}
            onCompleteClose={completeClose}
          />
        ))}
      </section>
    </main>
  )
}
