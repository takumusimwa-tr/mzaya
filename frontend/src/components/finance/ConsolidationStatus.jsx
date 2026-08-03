import PropTypes from 'prop-types'

export default function ConsolidationStatus({ runs }) {
  return (
    <div className="consolidation-status">
      {runs.map((run) => (
        <article key={run.id}>
          <div>
            <strong>{run.run_reference}</strong>
            <span>{run.period_code}</span>
          </div>
          <strong>{run.reporting_currency}</strong>
          <span className={`consolidation-run-status is-${run.status}`}>
            {run.status}
          </span>
        </article>
      ))}
    </div>
  )
}

ConsolidationStatus.propTypes = {
  runs: PropTypes.array.isRequired,
}
