import PropTypes from 'prop-types'

export default function TaxLiabilityTable({ liabilities }) {
  return (
    <div className="tax-liability-table">
      {liabilities.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.liability_reference}</strong>
            <span>{item.tax_code} · {item.period_key}</span>
          </div>
          <span>{item.currency}</span>
          <span>{item.closing_balance_minor}</span>
          <span className="tax-finance-status">{item.status}</span>
        </article>
      ))}
    </div>
  )
}

TaxLiabilityTable.propTypes = {
  liabilities: PropTypes.array.isRequired,
}
