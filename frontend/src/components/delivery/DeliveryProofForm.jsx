import { useState, useRef } from 'react'
import ImageUpload from '../ImageUpload'
import { buildDeliveryProofPayload } from '../../api/deliveryProofPayload'

const OPTIONS = [
  { value: 'recipient_confirmation', label: 'Recipient confirmation' },
  { value: 'photo', label: 'Delivery photo' },
  { value: 'signature', label: 'Recipient signature' },
]

export default function DeliveryProofForm({
  submitting,
  onSubmit,
  onCancel,
}) {
  const [proofType, setProofType] = useState('recipient_confirmation')
  const [recipientName, setRecipientName] = useState('')
  const [assetUrl, setAssetUrl] = useState('')
  const [error, setError] = useState('')
  const [notes, setNotes] = useState('')
  const lock = useRef(false)
  function uploaded(url) {
    try {
      const base = new URL(import.meta.env.VITE_API_URL || 'http://localhost:5000/api', window.location.origin)
      setAssetUrl(new URL(url, base.origin).href)
    } catch { setAssetUrl(''); setError('Invalid upload reference.') }
  }

  async function submit(event) {
    event.preventDefault()
    if (submitting || lock.current) return
    lock.current = true
    setError('')
    try {
      await onSubmit?.(buildDeliveryProofPayload({ proofType, recipientName, assetUrl, notes }))
    } catch (err) {
      setError(err.response?.status === 409 ? 'Delivery already recorded with different evidence. Refresh the order before retrying.' : err.response ? 'Unable to complete delivery. Check the order and try again.' : err.message || 'Unable to complete delivery.')
    } finally { lock.current = false }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="text-sm text-[var(--mzaya-error)]">{error}</p>}
      <fieldset disabled={submitting} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-slate-900">
          Proof method
        </label>
        <select
          value={proofType}
          onChange={(event) => { setProofType(event.target.value); setAssetUrl('') }}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {proofType === 'recipient_confirmation' ? (
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Recipient name
          </label>
          <input
            required
            maxLength={120}
            value={recipientName}
            onChange={(event) => setRecipientName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="Name of person receiving the order"
          />
        </div>
      ) : null}

      {['photo', 'signature'].includes(proofType) ? (
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Uploaded file URL
          </label>
          {proofType === 'photo' && <ImageUpload currentUrl={assetUrl} onUploaded={uploaded} label="Take / upload proof" />}
          <input
            required
            type="url"
            maxLength={4096}
            value={assetUrl}
            onChange={(event) => setAssetUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="HTTPS evidence URL"
          />
        </div>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-slate-900">
          Delivery notes
        </label>
        <textarea
          maxLength={500}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-3"
          placeholder="Optional handover details"
        />
      </div>

      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[var(--mzaya-primary)] px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'Completing…' : 'Complete delivery'}
        </button>
      </div>
    </form>
  )
}
