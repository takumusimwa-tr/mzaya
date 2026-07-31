import PropTypes from 'prop-types'

export default function ComplianceAuditTable({ entries }) {
  return (
    <div className="compliance-audit-table">
      {entries.map((entry) => (
        <article key={entry.id}>
          <div>
            <strong>{entry.action.replaceAll('_', ' ')}</strong>
            <span>{entry.resource_type.replaceAll('_', ' ')}</span>
          </div>
          <time dateTime={entry.occurred_at}>
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(entry.occurred_at))}
          </time>
        </article>
      ))}
    </div>
  )
}

ComplianceAuditTable.propTypes = {
  entries: PropTypes.array.isRequired,
}
