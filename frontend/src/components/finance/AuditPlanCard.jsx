import PropTypes from 'prop-types'

export default function AuditPlanCard({ plan }) {
  return (
    <article className="audit-plan-card">
      <div>
        <span>{plan.planning_method.replaceAll('_', ' ')}</span>
        <strong>{plan.name}</strong>
      </div>
      <strong>{plan.fiscal_year}</strong>
      <span className={`audit-status is-${plan.status}`}>
        {plan.status}
      </span>
    </article>
  )
}

AuditPlanCard.propTypes = {
  plan: PropTypes.object.isRequired,
}
