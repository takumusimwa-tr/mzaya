/**
 * MZAYA — Saved Addresses
 * Route owner: /addresses
 *
 * Architecture note:
 * This page owns interaction/state only. Persistence is centralized in
 * addressAPI so customer pages do not construct backend URLs independently.
 * The current backend address contract (label/address/notes/is_default) is
 * intentionally preserved; structured address expansion belongs in a later
 * schema/API migration rather than a visual refactor.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { addressAPI } from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'
import emptyAddresses from '../../assets/brand/illustrations/empty-states/mzaya-empty-addresses.svg'

const EMPTY_FORM = Object.freeze({
  label: '',
  address: '',
  notes: '',
  is_default: false,
})

export default function AddressesPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ ...EMPTY_FORM })

  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.list().then((r) => r.data.addresses || []),
  })

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ ...EMPTY_FORM })
  }

  const save = useMutation({
    mutationFn: (data) =>
      editId ? addressAPI.update(editId, data) : addressAPI.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['addresses'] })
      closeForm()
    },
  })

  const remove = useMutation({
    mutationFn: (id) => addressAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  })

  const openCreate = () => {
    setEditId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  const openEdit = (addr) => {
    setEditId(addr.id)
    setForm({
      label: addr.label || '',
      address: addr.address || '',
      notes: addr.notes || '',
      is_default: Boolean(addr.is_default),
    })
    setShowForm(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      label: form.label.trim(),
      address: form.address.trim(),
      notes: form.notes.trim(),
      is_default: Boolean(form.is_default),
    }
    if (!payload.label || !payload.address || save.isPending) return
    save.mutate(payload)
  }

  if (isLoading) return <LoadingScreen message="Loading addresses..." />

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F8' }}>
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-100"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Saved addresses</h1>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        {isError ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="font-bold text-gray-800">Couldn’t load addresses</p>
            <p className="text-gray-400 text-sm mt-1">Check your connection and try again.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold"
            >
              Try again
            </button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <img src={emptyAddresses} alt="" aria-hidden="true" className="mx-auto w-48 max-w-full mb-5 select-none" draggable="false" />
            <p className="font-bold text-gray-800 mb-1">No saved addresses</p>
            <p className="text-gray-400 text-sm">Add one for faster checkout</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl p-4 border border-gray-100"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 break-words">{addr.address}</p>
                  {addr.notes && (
                    <p className="text-xs text-gray-400 mt-0.5 break-words">
                      <Icon name="note" size={12} className="inline" /> {addr.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-2">
                  <button
                    type="button"
                    onClick={() => openEdit(addr)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium active:scale-95"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(addr.id)}
                    className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium active:scale-95 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-30 bg-gradient-to-t from-white via-white to-transparent">
        <button
          type="button"
          onClick={openCreate}
          className="w-full py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform"
          style={{ background: '#00A651', boxShadow: '0 8px 24px #00A65150' }}
        >
          + Add new address
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={closeForm}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 pb-3 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit address' : 'Add address'}</h2>
              <button type="button" aria-label="Close address form" onClick={closeForm} className="text-gray-400 text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 pb-6 overflow-y-auto">
              <div>
                <label htmlFor="address-label" className="text-xs text-gray-500">Label <span className="text-red-500">*</span></label>
                <input
                  id="address-label"
                  type="text"
                  value={form.label}
                  onChange={(event) => setForm({ ...form, label: event.target.value })}
                  placeholder="e.g. Home, Work, Mom's place"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label htmlFor="address-value" className="text-xs text-gray-500">Address <span className="text-red-500">*</span></label>
                <input
                  id="address-value"
                  type="text"
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="e.g. 15 Borrowdale Rd, Harare"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                />
              </div>
              <div>
                <label htmlFor="address-notes" className="text-xs text-gray-500">Delivery notes (optional)</label>
                <input
                  id="address-notes"
                  type="text"
                  value={form.notes}
                  onChange={(event) => setForm({ ...form, notes: event.target.value })}
                  placeholder="e.g. Blue gate, call on arrival"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(event) => setForm({ ...form, is_default: event.target.checked })}
                  style={{ accentColor: '#00A651' }}
                />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>

              {save.isError && (
                <p role="alert" className="text-sm text-red-600">
                  We couldn’t save this address. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={save.isPending || !form.label.trim() || !form.address.trim()}
                className="mt-3 py-3.5 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
                style={{ background: '#00A651' }}
              >
                {save.isPending ? 'Saving...' : editId ? 'Save changes' : 'Add address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
