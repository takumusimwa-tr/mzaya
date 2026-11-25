import { useState } from 'react'
import OperationalDeliveryHistory from './OperationalDeliveryHistory'
import useAuthStore from '../../store/useAuthStore'

export default function AdminDeliveryInspection() {
  const user = useAuthStore(s => s.user)
  const [input, setInput] = useState('')
  const [orderId, setOrderId] = useState('')
  const [error, setError] = useState('')
  if (user?.role !== 'admin') return null
  function inspect(event) {
    event.preventDefault()
    const id = input.trim().toLowerCase()
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
      setError('Enter the full order UUID.')
      setOrderId('')
      return
    }
    setError('')
    setOrderId(id)
  }
  return <div className="space-y-3">
    <form onSubmit={inspect} className="mzaya-surface p-5 space-y-3">
      <h2 className="font-semibold">Delivery inspection</h2>
      <p className="text-sm text-[var(--mzaya-text-secondary)]">Inspect recorded events and evidence for an active or completed order.</p>
      <label htmlFor="inspection-order-id" className="block text-sm font-medium">Order UUID</label>
      <input id="inspection-order-id" value={input} onChange={e => { setInput(e.target.value); setOrderId(''); setError('') }} maxLength={36} required className="w-full rounded-xl border border-gray-200 p-3 text-sm" />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="submit" className="rounded-xl bg-[var(--mzaya-primary)] px-4 py-3 text-sm font-semibold text-white">Inspect order</button>
    </form>
    {orderId && <OperationalDeliveryHistory key={`${user.id}:${orderId}`} orderId={orderId} />}
  </div>
}
