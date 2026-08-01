import PropTypes from 'prop-types'

export default function TaxFilingCalendar({ periods }) {
  return (
    <div className="tax-filing-calendar">
      {periods.map((period) => (
        <article key={period.id}>
          <div>
            <strong>{period.period_code}</strong>
            <span>{period.tax_type.toUpperCase()}</span>
          </div>
          <div>
            <span>Due</span>
            <strong>{period.due_date}</strong>
          </div>
          <span className={`tax-filing-status is-${period.status}`}>
            {period.status}
          </span>
        </article>
      ))}
    </div>
  )
}

TaxFilingCalendar.propTypes = {
  periods: PropTypes.array.isRequired,
}
