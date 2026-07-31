import PropTypes from 'prop-types'

export default function FinancialPeriodTable({
  periods,
  onClose,
  onReopen,
}) {
  return (
    <div className="financial-period-table">
      {periods.map((period) => (
        <article key={period.id}>
          <div>
            <strong>{period.code}</strong>
            <span>{period.start_date} — {period.end_date}</span>
          </div>

          <span className={`period-status is-${period.status}`}>
            {period.status}
          </span>

          {period.status === 'open' ? (
            <button type="button" onClick={() => onClose(period.id)}>
              Close period
            </button>
          ) : (
            <button type="button" onClick={() => onReopen(period.id)}>
              Reopen
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

FinancialPeriodTable.propTypes = {
  periods: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onReopen: PropTypes.func.isRequired,
}
