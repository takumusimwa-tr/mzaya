import { useState, useEffect, useRef } from 'react'
import { paymentAPI } from '../api/api'
import Icon from './ui/Icon'

// Payment methods.
//
// There is deliberately NO separate "Diaspora" option. It used to be here, but
// it routed to the exact same Paynow hosted page as "Card" — two buttons calling
// identical code, implying a capability that didn't exist. Paynow's card page
// already accepts international cards, so someone paying from London just uses
// Card. (Paynow does sell a distinct diaspora/remittance product; it needs
// specific merchant-account enablement and a different integration. If you
// enable it, it becomes a real method here — not before.)
const METHODS = [
  { id: 'ecocash',  label: 'EcoCash',   sub: 'Econet mobile money',      kind: 'mobile' },
  { id: 'onemoney', label: 'OneMoney',  sub: 'NetOne mobile money',      kind: 'mobile' },
  { id: 'innbucks', label: 'InnBucks',  sub: 'Mobile wallet',            kind: 'mobile' },
  { id: 'card',     label: 'Card',      sub: 'Visa / Mastercard', kind: 'redirect' },
]

// Handles the whole Paynow payment lifecycle for one order.
export default function PaymentPanel({ order, onPaid }) {
  const [method, setMethod]   = useState('ecocash')
  const [phone, setPhone]     = useState('')
  const [stage, setStage]     = useState('choose') // choose | pushing | polling | redirecting | paid | failed
  const [message, setMessage] = useState('')
  const [error, setError]     = useState('')
  const pollTimer = useRef(null)

  // One key per payment intent. Regenerated when the customer changes method or
  // number — that's a genuinely different intent and deserves a fresh attempt.
  // Seeded once via a lazy useState initializer — the impure Date.now()/random
  // call runs a single time, inside the initializer function, never in the render
  // body. useRef then holds the mutable value the effect updates.
  const [initialKey] = useState(() => `${order.id}:${Date.now()}:${Math.random().toString(36).slice(2)}`)
  const idempotencyKey = useRef(initialKey)
  useEffect(() => {
    idempotencyKey.current = `${order.id}:${method}:${phone}`
  }, [order.id, method, phone])

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
        // The number the customer TYPED. The backend previously ignored this and
        // sent the prompt to their profile number instead — so anyone paying from
        // a spouse's or second line never received it.
        payment_phone: phone.trim(),
        // Idempotency: a double-tap, a retry, or a flaky connection must never
        // produce two USSD prompts (or two charges). Same key ⇒ same attempt.
        idempotency_key: idempotencyKey.current,
      })

      if (data.redirectUrl) {
        // Card / diaspora → go to Paynow (or mock success return).
        window.location.href = data.redirectUrl
        return
      }

      // Mobile money → prompt sent, begin polling.
      setStage('polling')
      setMessage(
        data.sentTo
          ? `Approve the prompt sent to ${data.sentTo}.`
          : (data.instructions || 'Check your phone and approve the prompt.')
      )
      startPolling()
    } catch (err) {
      setStage('failed')
      setError(err.response?.data?.error || 'Could not start payment')
    }
  }

  if (stage === 'paid') {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center">
        <div className="mb-2 flex justify-center" style={{ color: '#00A651' }}><Icon name="delivered" size={40} /></div>
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
          <div className="mb-2 flex justify-center animate-pulse text-gray-400"><Icon name="call" size={30} /></div>
          <p className="font-semibold text-gray-800">Waiting for confirmation…</p>
          <p className="text-xs text-gray-400 mt-1">{message}</p>
        </div>
      ) : stage === 'redirecting' ? (
        <div className="py-6 text-center">
          <div className="mb-2 flex justify-center animate-pulse text-gray-400"><Icon name="enroute" size={30} /></div>
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
