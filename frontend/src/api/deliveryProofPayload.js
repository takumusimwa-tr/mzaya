export function buildDeliveryProofPayload({ proofType, recipientName = '', assetUrl = '', notes = '' }) {
  const name = recipientName.trim()
  const url = assetUrl.trim()
  const detail = notes.trim()
  if (!['recipient_confirmation', 'photo', 'signature'].includes(proofType)) throw new Error('Unsupported evidence method.')
  if (name.length > 120 || detail.length > 500 || url.length > 4096) throw new Error('Evidence exceeds the allowed length.')
  if (proofType === 'recipient_confirmation' && !name) throw new Error('Enter the recipient name.')
  if (proofType !== 'recipient_confirmation') {
    let parsed
    try { parsed = new URL(url) } catch { throw new Error('Enter a valid HTTPS evidence URL.') }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Enter a valid HTTPS evidence URL.')
  }
  return { proof_type: proofType, ...(name && { recipient_name: name }), ...(detail && { notes: detail }), ...(proofType === 'photo' && { photo_url: url }), ...(proofType === 'signature' && { signature_url: url }) }
}
