import DeliveryProofForm from './DeliveryProofForm'

export default function DeliveryProofDialog({
  open,
  submitting,
  onSubmit,
  onClose,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-proof-title"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5">
          <p className="text-sm font-semibold text-emerald-700">Final step</p>
          <h2
            id="delivery-proof-title"
            className="mt-1 text-xl font-semibold text-slate-950"
          >
            Confirm successful handover
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Record one clear proof before closing this delivery.
          </p>
        </div>

        <DeliveryProofForm
          submitting={submitting}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  )
}
