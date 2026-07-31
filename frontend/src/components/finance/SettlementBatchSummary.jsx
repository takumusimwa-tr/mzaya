import PropTypes from 'prop-types'

function formatMinor(value, currency) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(Number(value || 0) / 100)
}

export default function SettlementBatchSummary({
  batch,
  onApprove,
  onSubmit,
}) {
  return (
    <section className="settlement-batch-summary">
      <header>
        <div>
          <p className="finance-eyebrow">Settlement batch</p>
          <h2>{batch.batch_reference}</h2>
        </div>

        <span className={`settlement-status is-${batch.status}`}>
          {batch.status.replaceAll('_', ' ')}
        </span>
      </header>

      <div className="settlement-batch-summary__metrics">
        <article>
          <span>Gross</span>
          <strong>
            {formatMinor(batch.total_gross_minor, batch.currency)}
          </strong>
        </article>
        <article>
          <span>Adjustments</span>
          <strong>
            {formatMinor(batch.total_adjustments_minor, batch.currency)}
          </strong>
        </article>
        <article>
          <span>Net payout</span>
          <strong>
            {formatMinor(batch.total_net_minor, batch.currency)}
          </strong>
        </article>
        <article>
          <span>Items</span>
          <strong>{batch.item_count}</strong>
        </article>
      </div>

      <div className="settlement-batch-summary__actions">
        {batch.status === 'draft' && (
          <button type="button" onClick={() => onApprove(batch.id)}>
            Approve batch
          </button>
        )}

        {batch.status === 'approved' && (
          <button type="button" onClick={() => onSubmit(batch.id)}>
            Submit payouts
          </button>
        )}
      </div>
    </section>
  )
}

SettlementBatchSummary.propTypes = {
  batch: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
