import PropTypes from 'prop-types'

export default function OutboxQueueTable({ items }) {
  return (
    <div className="finance-outbox-table">
      {items.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.event_type}</strong>
            <span>{item.source_system} · {item.event_key}</span>
          </div>
          <span>{item.attempt_count} attempts</span>
          <span>{item.available_at}</span>
          <span className="finance-reliability-status">{item.status}</span>
        </article>
      ))}
    </div>
  )
}

OutboxQueueTable.propTypes = {
  items: PropTypes.array.isRequired,
}
