import PropTypes from 'prop-types'

function money(minor, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(minor || 0) / 100)
}

export default function TreasuryTransferTable({
  transfers,
  onApprove,
}) {
  return (
    <div className="treasury-transfer-table">
      {transfers.map((item) => (
        <article key={item.id}>
          <div>
            <strong>{item.transfer_reference}</strong>
            <span>{item.transfer_type}</span>
          </div>
          <strong>{money(item.amount_minor, item.currency)}</strong>
          <span>{item.provider || 'Internal'}</span>
          <span className="treasury-status">{item.status}</span>
          {item.status === 'draft' ? (
            <button type="button" onClick={() => onApprove(item.id)}>
              Approve
            </button>
          ) : <span />}
        </article>
      ))}
    </div>
  )
}

TreasuryTransferTable.propTypes = {
  transfers: PropTypes.array.isRequired,
  onApprove: PropTypes.func.isRequired,
}
