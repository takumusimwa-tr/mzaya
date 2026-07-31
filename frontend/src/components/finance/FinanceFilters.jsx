import PropTypes from 'prop-types'

export default function FinanceFilters({
  filters,
  onChange,
  onRefresh,
}) {
  return (
    <section className="finance-filters">
      <label>
        Currency
        <select
          value={filters.currency}
          onChange={(event) => onChange({
            ...filters,
            currency: event.target.value,
          })}
        >
          <option value="USD">USD</option>
          <option value="ZWL">ZWL</option>
        </select>
      </label>

      <label>
        From
        <input
          type="date"
          value={filters.startDate}
          onChange={(event) => onChange({
            ...filters,
            startDate: event.target.value,
          })}
        />
      </label>

      <label>
        To
        <input
          type="date"
          value={filters.endDate}
          onChange={(event) => onChange({
            ...filters,
            endDate: event.target.value,
          })}
        />
      </label>

      <button type="button" onClick={onRefresh}>
        Refresh
      </button>
    </section>
  )
}

FinanceFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
}
