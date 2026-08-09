import PropTypes from 'prop-types'

function money(minor, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(minor || 0) / 100)
}

export default function VendorSettlementTable({
  settlements,
  onApprove,
}) {
  return (
    <div className="vendor-settlement-table">
      {settlements.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.settlement_reference}</strong>
            <span>{item.vendor_id}</span>
          </div>

          <strong>
            {money(item.amount_due_minor, item.currency)}
          </strong>

          <span>{item.status}</span>

          {item.status === 'draft' ? (
            <button
              type="button"
              onClick={() => onApprove(item.id)}
            >
              Approve
            </button>
          ) : <span />}
        </article>
      ))}
    </div>
  )
}

VendorSettlementTable.propTypes = {
  settlements: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
}
