import PropTypes from 'prop-types'

export default function PaymentReconciliationTable({ results, onReconcile }) {
  return (
    <div className="payment-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.payment_id}</strong>
            <span>{item.result_reference}</span>
          </div>
          <span>{item.currency || '—'}</span>
          <span>
            {item.expected_amount_minor == null
              ? '—'
              : (Number(item.expected_amount_minor) / 100).toFixed(2)}
          </span>
          <span className="payment-finance-status">
            {item.status}
          </span>
          <button
            type="button"
            onClick={() => onReconcile(item.payment_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

PaymentReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
