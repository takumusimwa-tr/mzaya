import PropTypes from 'prop-types'

export default function AuditFindingTable({ findings }) {
  return (
    <div className="audit-finding-table">
      {findings.map((finding) => (
        <article key={finding.id}>
          <div>
            <strong>{finding.title}</strong>
            <span>{finding.finding_reference}</span>
          </div>
          <span className={`audit-severity is-${finding.severity}`}>
            {finding.severity}
          </span>
          <span>{finding.target_date || 'No target date'}</span>
          <span>{finding.status}</span>
        </article>
      ))}
    </div>
  )
}

AuditFindingTable.propTypes = {
  findings: PropTypes.array.isRequired,
}
