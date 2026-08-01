import PropTypes from 'prop-types'

export default function VarianceTable({ reports }) {
  return (
    <div className="variance-table">
      {reports.map((report) => (
        <article key={report.id}>
          <div>
            <strong>{report.report_reference}</strong>
            <span>{report.report_type.replaceAll('_', ' ')}</span>
          </div>

          <span>{report.period_from} — {report.period_to}</span>

          <strong>{report.currency}</strong>

          <span>{report.status}</span>
        </article>
      ))}
    </div>
  )
}

VarianceTable.propTypes = {
  reports: PropTypes.array.isRequired,
}
