import PropTypes from 'prop-types'

function money(minor, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(minor || 0) / 100)
}

export default function MzayaPayoutTable({
  payouts,
  onApprove,
}) {
  return (
    <div className="mzaya-payout-table">
      {payouts.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.payout_reference}</strong>
            <span>{item.mzaya_id}</span>
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

MzayaPayoutTable.propTypes = {
  payouts: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
}
