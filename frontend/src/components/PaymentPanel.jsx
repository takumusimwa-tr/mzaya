import { useState, useEffect, useRef } from 'react'
import { paymentAPI } from '../api/api'

const METHODS = [
  { id: 'ecocash',  label: 'EcoCash',   sub: 'Econet mobile money', kind: 'mobile' },
  { id: 'onemoney', label: 'OneMoney',  sub: 'NetOne mobile money',  kind: 'mobile' },
  { id: 'innbucks', label: 'InnBucks',  sub: 'Mobile wallet',        kind: 'mobile' },
  { id: 'card',     label: 'Card',      sub: 'Visa / Mastercard',    kind: 'redirect' },
  { id: 'diaspora', label: 'Diaspora',  sub: 'Pay from abroad',      kind: 'redirect' },
]

// Handles the whole Paynow payment lifecycle for one order.
export default function PaymentPanel({ order, onPaid }) {
  const [method, setMethod]   = useState('ecocash')
  const [phone, setPhone]     = useState('')
  const [stage, setStage]     = useState('choose') // choose | pushing | polling | redirecting | paid | failed
  const [message, setMessage] = useState('')
  const [error, setError]     = useState('')
  const pollTimer = useRef(null)

  const chosen = METHODS.find((m) => m.id === method)
  const isMobile = chosen?.kind === 'mobile'

  useEffect(() => () => clearInterval(pollTimer.current), [])

  const startPolling = () => {
    clearInterval(pollTimer.current)
    pollTimer.current = setInterval(async () => {
      try {
        const { data } = await paymentAPI.poll(order.id)
        if (data.status === 'success' || data.paid) {
          clearInterval(pollTimer.current)
          setStage('paid')
          onPaid?.()
        } else if (data.status === 'failed') {
          clearInterval(pollTimer.current)
          setStage('failed')
          setError('Payment failed or was cancelled.')
        }
      } catch {
        /* keep polling; transient */
      }
    }, 3000)
  }

  const pay = async () => {
    setError('')
    if (isMobile && !phone.trim()) { setError('Enter your mobile money number'); return }

    setStage(isMobile ? 'pushing' : 'redirecting')
    try {
      const { data } = await paymentAPI.initiate(order.id, {
        payment_method: method,
        currency: 'USD',
        phone: phone.trim(),
      })

      if (data.redirectUrl) {
        // Card / diaspora → go to Paynow (or mock success return).
        window.location.href = data.redirectUrl
        return
      }

      // Mobile money → prompt sent, begin polling.
      setStage('polling')
      setMessage(data.instructions || 'Check your phone and approve the prompt.')
      startPolling()
    } catch (err) {
      setStage('failed')
      setError(err.response?.data?.error || 'Could not start payment')
    }
  }

  if (stage === 'paid') {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="font-bold text-gray-900">Payment received</p>
        <p className="text-sm text-gray-400 mt-1">Your order is being processed.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-700">Pay for your order</h2>
        <div className="text-right">
          <span className="font-black text-gray-900">${Number(order.total_usd).toFixed(2)}</span>
          {order.total_zig > 0 && (
            <p className="text-[11px] text-gray-400">≈ ZiG {Number(order.total_zig).toFixed(2)}</p>
          )}
        </div>
      </div>

      {stage === 'polling' ? (
        <div className="py-6 text-center">
          <div className="text-3xl mb-2 animate-pulse">📲</div>
          <p className="font-semibold text-gray-800">Waiting for confirmation…</p>
          <p className="text-xs text-gray-400 mt-1">{message}</p>
        </div>
      ) : stage === 'redirecting' ? (
        <div className="py-6 text-center">
          <div className="text-3xl mb-2 animate-pulse">🔗</div>
          <p className="font-semibold text-gray-800">Redirecting to Paynow…</p>
        </div>
      ) : (
        <>
          {/* Method picker */}
          <div className="flex flex-col gap-2 mb-3">
            {METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                className="flex items-center justify-between p-3 rounded-xl border text-left transition-all"
                style={method === m.id ? { borderColor: '#00A651', background: '#EDFAF3' } : { borderColor: '#E5E7EB' }}>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sub}</p>
                </div>
                <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: method === m.id ? '#00A651' : '#D1D5DB' }}>
                  {method === m.id && <span className="w-2 h-2 rounded-full" style={{ background: '#00A651' }} />}
                </span>
              </button>
            ))}
          </div>

          {isMobile && (
            <div className="mb-3">
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="07X XXX XXXX"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-green-500" />
            </div>
          )}

          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

          <button onClick={pay}
            className="w-full py-3.5 rounded-xl text-white font-bold active:scale-98 transition-transform"
            style={{ background: '#00A651' }}>
            Pay ${Number(order.total_usd).toFixed(2)}
          </button>
          {stage === 'failed' && (
            <button onClick={() => setStage('choose')} className="w-full mt-2 text-xs text-gray-400">Try again</button>
          )}
        </>
      )}
    </div>
  )
}
