import useBudgets from '../../hooks/useBudgets'
import BudgetCard from '../../components/finance/BudgetCard'
import '../../components/finance/budgeting.css'

export default function BudgetDashboard() {
  const {
    budgets,
    loading,
    approveVersion,
  } = useBudgets()

  if (loading) {
    return <p className="budgeting-state">Loading budgets…</p>
  }

  return (
    <main className="budgeting-page">
      <header>
        <p className="finance-eyebrow">Financial planning</p>
        <h1>Budgets</h1>
        <p>
          Annual plans, departmental allocations, revisions, and approvals.
        </p>
      </header>

      <section className="budget-card-grid">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onApprove={approveVersion}
          />
        ))}
      </section>
    </main>
  )
}
