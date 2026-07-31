import { useState } from 'react'

const OPTIONS = [
  { value: 'recipient_confirmation', label: 'Recipient confirmation' },
  { value: 'photo', label: 'Delivery photo' },
  { value: 'signature', label: 'Recipient signature' },
  { value: 'otp', label: 'Verified delivery code' },
]

export default function DeliveryProofForm({
  submitting,
  onSubmit,
  onCancel,
}) {
  const [proofType, setProofType] = useState('recipient_confirmation')
  const [recipientName, setRecipientName] = useState('')
  const [assetUrl, setAssetUrl] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [notes, setNotes] = useState('')

  function submit(event) {
    event.preventDefault()

    onSubmit?.({
      proof_type: proofType,
      recipient_name: recipientName || undefined,
      photo_url: proofType === 'photo' ? assetUrl : undefined,
      signature_url: proofType === 'signature' ? assetUrl : undefined,
      otp_verified: proofType === 'otp' ? otpVerified : false,
      notes: notes || undefined,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-slate-900">
          Proof method
        </label>
        <select
          value={proofType}
          onChange={(event) => setProofType(event.target.value)}
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
          <input
            required
            type="url"
            value={assetUrl}
            onChange={(event) => setAssetUrl(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
            placeholder="Secure upload URL"
          />
        </div>
      ) : null}

      {proofType === 'otp' ? (
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            checked={otpVerified}
            onChange={(event) => setOtpVerified(event.target.checked)}
          />
          I verified the recipient’s delivery code
        </label>
      ) : null}

      <div>
        <label className="text-sm font-semibold text-slate-900">
          Delivery notes
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-3"
          placeholder="Optional handover details"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {submitting ? 'Completing…' : 'Complete delivery'}
        </button>
      </div>
    </form>
  )
}
