import PropTypes from 'prop-types'

export default function BudgetCard({
  budget,
  onApprove,
}) {
  const latest = budget.versions?.at(-1)

  return (
    <article className="budget-card">
      <div>
        <span>{budget.budget_type.replaceAll('_', ' ')}</span>
        <strong>{budget.name}</strong>
      </div>

      <strong>{budget.currency} · {budget.fiscal_year}</strong>

      <span>{budget.status}</span>

      {latest?.status === 'draft' && (
        <button
          type="button"
          onClick={() => onApprove(latest.id)}
        >
          Approve version
        </button>
      )}
    </article>
  )
}

BudgetCard.propTypes = {
  budget: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
}
