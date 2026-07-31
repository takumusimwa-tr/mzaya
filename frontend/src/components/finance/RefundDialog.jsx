import { useState } from 'react'
import PropTypes from 'prop-types'
import useRefunds from '../../hooks/useRefunds'
import './refunds.css'

export default function RefundDialog({
  open,
  paymentId,
  maxAmountMinor,
  currency,
  onClose,
  onCreated,
}) {
  const [amountMinor, setAmountMinor] = useState(maxAmountMinor || 0)
  const [reason, setReason] = useState('customer_request')
  const [notes, setNotes] = useState('')
  const { requestRefund, submitting } = useRefunds()

  if (!open) return null

  const submit = async (event) => {
    event.preventDefault()
    const refund = await requestRefund({
      paymentId,
      amountMinor: Number(amountMinor),
      reason,
      notes: notes || undefined,
    })
    onCreated?.(refund)
    onClose()
  }

  return (
    <div className="refund-dialog" role="dialog" aria-modal="true">
      <form onSubmit={submit}>
        <header>
          <p>Finance action</p>
          <h2>Create refund</h2>
        </header>

        <label>
          Amount
          <div className="refund-dialog__amount">
            <span>{currency}</span>
            <input
              type="number"
              min="1"
              max={maxAmountMinor}
              value={amountMinor}
              onChange={(event) => setAmountMinor(event.target.value)}
            />
          </div>
          <small>Enter the amount in minor units.</small>
        </label>

        <label>
          Reason
          <select value={reason} onChange={(event) => setReason(event.target.value)}>
            <option value="customer_request">Customer request</option>
            <option value="item_unavailable">Item unavailable</option>
            <option value="delivery_failure">Delivery failure</option>
            <option value="duplicate_payment">Duplicate payment</option>
            <option value="quality_issue">Quality issue</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Request refund'}
          </button>
        </footer>
      </form>
    </div>
  )
}

RefundDialog.propTypes = {
  open: PropTypes.bool,
  paymentId: PropTypes.string,
  maxAmountMinor: PropTypes.number,
  currency: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func,
}

RefundDialog.defaultProps = {
  open: false,
  paymentId: null,
  maxAmountMinor: 0,
  currency: 'USD',
  onCreated: null,
}
