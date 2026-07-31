import PropTypes from 'prop-types'

export default function TicketAuditTimeline({ entries }) {
  return (
    <section className="ticket-audit">
      <p className="eyebrow">Audit history</p>
      <h2>Ticket timeline</h2>

      <ol>
        {entries?.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.action.replaceAll('_', ' ')}</strong>
            <time dateTime={entry.created_at}>
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(entry.created_at))}
            </time>
          </li>
        ))}
      </ol>
    </section>
  )
}

TicketAuditTimeline.propTypes = {
  entries: PropTypes.array,
}

TicketAuditTimeline.defaultProps = {
  entries: [],
}
