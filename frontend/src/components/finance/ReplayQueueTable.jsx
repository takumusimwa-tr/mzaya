import PropTypes from 'prop-types'

export default function ReplayQueueTable({ items }) {
  return (
    <div className="finance-replay-table">
      {items.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.business_event_id}</strong>
            <span>{item.replay_reason}</span>
          </div>
          <span>{item.attempts} attempts</span>
          <span>{item.next_attempt_at}</span>
          <span className="finance-event-status">{item.status}</span>
        </article>
      ))}
    </div>
  )
}

ReplayQueueTable.propTypes = {
  items: PropTypes.array.isRequired,
}
