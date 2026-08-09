import PropTypes from 'prop-types'

export default function TaxTransactionTable({ transactions }) {
  return (
    <div className="tax-transaction-table">
      {transactions.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.tax_reference}</strong>
            <span>{item.tax_code} · {item.tax_type}</span>
          </div>
          <span>{item.currency}</span>
          <span>{item.tax_amount_minor}</span>
          <span className="tax-finance-status">{item.status}</span>
        </article>
      ))}
    </div>
  )
}

TaxTransactionTable.propTypes = {
  transactions: PropTypes.array.isRequired,
}
