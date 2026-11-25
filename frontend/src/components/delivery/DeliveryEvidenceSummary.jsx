const labels = { photo: 'Photo reference', signature: 'Signature reference', recipient_confirmation: 'Recipient confirmation', otp: 'Delivery code' }

export default function DeliveryEvidenceSummary({ proof }) {
  return <section className="mzaya-surface p-5" aria-label="Delivery evidence">
    <h2 className="font-semibold">Delivery evidence</h2>
    {!proof ? <p className="mt-2 text-sm text-[var(--mzaya-text-secondary)]">No evidence recorded.</p> : <>
      <p className="mt-2 text-sm font-medium">{labels[proof.proof_type] || 'Recorded evidence'}</p>
      {proof.captured_at && <time dateTime={proof.captured_at} className="text-xs text-[var(--mzaya-text-secondary)]">{new Date(proof.captured_at).toLocaleString()}</time>}
      <p className="mt-2 text-xs text-[var(--mzaya-text-secondary)]">Evidence recorded at handover. Authenticity has not been independently verified.</p>
    </>}
  </section>
}
