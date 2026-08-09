import PropTypes from 'prop-types'

export default function DeadLetterTable({
  items,
  onReplay,
}) {
  return (
    <div className="finance-dead-letter-table">
      {items.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.dead_letter_reference}</strong>
            <span>{item.reason_code}</span>
          </div>
          <span>{item.attempt_count} attempts</span>
          <span className="finance-reliability-status">{item.status}</span>
          <button
            type="button"
            disabled={item.status !== 'quarantined'}
            onClick={() => onReplay(item.id)}
          >
            Replay
          </button>
        </article>
      ))}
    </div>
  )
}

DeadLetterTable.propTypes = {
  items: PropTypes.array.isRequired,
  onReplay: PropTypes.func.isRequired,
}
