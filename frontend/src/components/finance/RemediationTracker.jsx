import PropTypes from 'prop-types'

export default function RemediationTracker({
  actions,
  onComplete,
  onVerify,
}) {
  return (
    <div className="remediation-tracker">
      {actions.map((action) => (
        <article key={action.id}>
          <div>
            <strong>{action.action_title}</strong>
            <span>{action.action_reference}</span>
          </div>

          <span>{action.due_date}</span>
          <span className={`audit-status is-${action.status}`}>
            {action.status.replaceAll('_', ' ')}
          </span>

          <div className="remediation-actions">
            {['open', 'in_progress', 'overdue'].includes(action.status) && (
              <button
                type="button"
                onClick={() => onComplete(action.id, {})}
              >
                Complete
              </button>
            )}

            {action.status === 'completed_pending_verification' && (
              <button
                type="button"
                onClick={() => {
                  const notes = window.prompt('Verification notes')
                  if (notes) onVerify(action.id, notes)
                }}
              >
                Verify
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

RemediationTracker.propTypes = {
  actions: PropTypes.array.isRequired,
  onComplete: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
}
