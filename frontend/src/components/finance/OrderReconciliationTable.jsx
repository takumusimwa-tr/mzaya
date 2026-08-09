import PropTypes from 'prop-types'

export default function OrderReconciliationTable({
  results,
  onReconcile,
}) {
  return (
    <div className="order-reconciliation-table">
      {results.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.order_id}</strong>
            <span>{item.order_type} · {item.result_reference}</span>
          </div>

          <span>{item.currency || '—'}</span>

          <span>
            {item.expected_gov_minor == null
              ? '—'
              : (Number(item.expected_gov_minor) / 100).toFixed(2)}
          </span>

          <span className="order-finance-status">
            {item.status}
          </span>

          <button
            type="button"
            onClick={() => onReconcile(item.order_type, item.order_id)}
          >
            Recheck
          </button>
        </article>
      ))}
    </div>
  )
}

OrderReconciliationTable.propTypes = {
  results: PropTypes.array.isRequired,
  onReconcile: PropTypes.func.isRequired,
}
