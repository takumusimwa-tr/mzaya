import PropTypes from 'prop-types'

export default function GroupReportCard({ report }) {
  const data = report.report_data || {}

  return (
    <article className="group-report-card">
      <div>
        <span>{report.report_type.replaceAll('_', ' ')}</span>
        <strong>{report.reporting_currency}</strong>
      </div>
      <strong>
        Net income{' '}
        {(Number(data.netIncomeMinor || 0) / 100).toFixed(2)}
      </strong>
      <span>{report.status}</span>
    </article>
  )
}

GroupReportCard.propTypes = {
  report: PropTypes.object.isRequired,
}
