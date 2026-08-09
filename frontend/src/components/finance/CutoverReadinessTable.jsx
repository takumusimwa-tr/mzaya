import PropTypes from 'prop-types'

export default function CutoverReadinessTable({ checks }) {
  return (
    <div className="cutover-readiness-table">
      {checks.map((check) => (
        <article key={check.id}>
          <div>
            <strong>{check.name}</strong>
            <span>{check.check_key}</span>
          </div>
          <span>{check.severity}</span>
          <span className="finance-cutover-status">
            {check.result}
          </span>
        </article>
      ))}
    </div>
  )
}

CutoverReadinessTable.propTypes = {
  checks: PropTypes.array.isRequired,
}
