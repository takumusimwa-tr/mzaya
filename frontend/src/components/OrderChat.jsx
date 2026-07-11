import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatAPI } from '../api/api'
import useSocketEvent from '../hooks/useSocketEvent'

const ROLE_LABELS = { customer: 'Customer', rider: 'Rider', vendor: 'Store' }
const ROLE_COLORS = { customer: '#00A651', rider: '#2563EB', vendor: '#D97706' }

// Full-screen-ish chat sheet for one order. Any participant (customer/rider/
// vendor) can open it. Includes click-to-call for the other parties.
export default function OrderChat({ orderId, onClose }) {
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['chat', orderId],
    queryFn:  () => chatAPI.messages(orderId).then((r) => r.data),
    refetchInterval: 20000, // fallback; socket drives live
  })
  const { data: contactData } = useQuery({
    queryKey: ['chat-contacts', orderId],
    queryFn:  () => chatAPI.contacts(orderId).then((r) => r.data),
  })

  const messages = data?.messages || []
  const myRole   = data?.my_role
  const contacts = contactData?.contacts || []

  const send = useMutation({
    mutationFn: (body) => chatAPI.send(orderId, body),
    onSuccess:  () => { setText(''); queryClient.invalidateQueries(['chat', orderId]) },
  })

  // Live: new message pushed for this order.
  useSocketEvent('chat:new', (payload) => {
    if (payload?.orderId === orderId) queryClient.invalidateQueries(['chat', orderId])
  }, [orderId])

  // Auto-scroll to newest.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  const submit = () => { if (text.trim()) send.mutate(text.trim()) }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 border-b border-gray-100 flex items-center justify-between" style={{ background: '#00A651' }}>
        <div>
          <p className="text-white font-bold">Order chat</p>
          <p className="text-white/70 text-xs">Customer · Rider · Store</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center">✕</button>
      </div>

      {/* Call bar — click-to-call the other parties */}
      {contacts.length > 0 && (
        <div className="flex gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50 overflow-x-auto">
          {contacts.map((c) => (
            <a key={c.role} href={`tel:${c.phone}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-semibold active:scale-95"
              style={{ color: ROLE_COLORS[c.role] }}>
              📞 {ROLE_LABELS[c.role]}
            </a>
          ))}
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {isLoading ? (
          <p className="text-center text-sm text-gray-400 mt-8">Loading…</p>
        ) : messages.length === 0 ? (
          <div className="text-center mt-10">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm text-gray-500">No messages yet</p>
            <p className="text-xs text-gray-400 mt-1">Coordinate the delivery here.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === myRole
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  {!mine && (
                    <p className="text-[10px] font-bold mb-0.5" style={{ color: ROLE_COLORS[m.sender_role] }}>
                      {ROLE_LABELS[m.sender_role]} · {m.sender?.name?.split(' ')[0]}
                    </p>
                  )}
                  <div className="px-3 py-2 rounded-2xl text-sm"
                    style={mine
                      ? { background: '#00A651', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: '#F3F4F6', color: '#111827', borderBottomLeftRadius: 4 }
                    }>
                    {m.body}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 px-3 py-2 flex items-center gap-2 pb-6">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Type a message…"
          className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 text-sm outline-none"
        />
        <button onClick={submit} disabled={!text.trim() || send.isPending}
          className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-40"
          style={{ background: '#00A651' }}>
          ➤
        </button>
      </div>
    </div>
  )
}
