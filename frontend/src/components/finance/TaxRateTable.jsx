import PropTypes from 'prop-types'

export default function TaxRateTable({ rates }) {
  return (
    <div className="tax-rate-table">
      <div className="tax-rate-table__header">
        <span>Tax</span>
        <span>Applies to</span>
        <span>Rate</span>
        <span>Effective</span>
      </div>

      {rates.map((rate) => (
        <div key={rate.id} className="tax-rate-table__row">
          <strong>{rate.name}</strong>
          <span>{rate.applies_to.replaceAll('_', ' ')}</span>
          <span>{(Number(rate.rate_basis_points) / 100).toFixed(2)}%</span>
          <span>{rate.effective_from}</span>
        </div>
      ))}
    </div>
  )
}

TaxRateTable.propTypes = {
  rates: PropTypes.array.isRequired,
}
