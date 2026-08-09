import PropTypes from 'prop-types'

export default function CutoverControlCard({
  control,
  onRequest,
  onRollback,
}) {
  const active = control.status === 'active'

  return (
    <article className="cutover-control-card">
      <header>
        <div>
          <span>{control.domain_key || 'global'}</span>
          <strong>{control.name}</strong>
        </div>
        <span className="finance-cutover-status">
          {control.status}
        </span>
      </header>

      <dl>
        <div>
          <dt>Current mode</dt>
          <dd>{control.current_mode}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{control.target_mode}</dd>
        </div>
      </dl>

      <footer>
        {active ? (
          <button
            type="button"
            onClick={() => onRollback(
              control.id,
              'Operational rollback requested from finance cutover console.'
            )}
          >
            Roll back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRequest(
              control.id,
              'Request controlled finance event-engine cutover.'
            )}
          >
            Request cutover
          </button>
        )}
      </footer>
    </article>
  )
}

CutoverControlCard.propTypes = {
  control: PropTypes.object.isRequired,
  onRequest: PropTypes.func.isRequired,
  onRollback: PropTypes.func.isRequired,
}
