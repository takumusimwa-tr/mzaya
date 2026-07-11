import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Icon from '../../components/ui/Icon'

export default function AddressesPage() {
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm] = useState({ label: '', address: '', notes: '', is_default: false })

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn:  () => api.get('/addresses').then((r) => r.data.addresses),
  })

  const save = useMutation({
    mutationFn: (data) => editId
      ? api.put(`/addresses/${editId}`, data)
      : api.post('/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['addresses'])
      closeForm()
    },
  })

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/addresses/${id}`),
    onSuccess:  () => queryClient.invalidateQueries(['addresses']),
  })

  const closeForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ label: '', address: '', notes: '', is_default: false })
  }

  const openEdit = (addr) => {
    setEditId(addr.id)
    setForm({ label: addr.label, address: addr.address, notes: addr.notes || '', is_default: addr.is_default })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.label.trim() || !form.address.trim()) return
    save.mutate(form)
  }

  if (isLoading) return <LoadingScreen message="Loading addresses..." />

  return (
    <div className="min-h-screen pb-28" style={{ background: '#F8F8F8' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-gray-100">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Saved addresses</h1>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        {(!addresses || addresses.length === 0) ? (
          <div className="text-center py-16 bg-white rounded-2xl" style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
            <div className="mb-3 flex justify-center text-gray-300"><Icon name="location" size={48} /></div>
            <p className="font-bold text-gray-800 mb-1">No saved addresses</p>
            <p className="text-gray-400 text-sm">Add one for faster checkout</p>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id} className="bg-white rounded-2xl p-4 border border-gray-100"
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{addr.address}</p>
                  {addr.notes && <p className="text-xs text-gray-400 mt-0.5"><Icon name="note" size={12} className="inline" /> {addr.notes}</p>}
                </div>
                <div className="flex gap-2 ml-2">
                  <button onClick={() => openEdit(addr)}
                    className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium active:scale-95">
                    Edit
                  </button>
                  <button onClick={() => remove.mutate(addr.id)}
                    className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium active:scale-95">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-30">
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ label: '', address: '', notes: '', is_default: false }) }}
          className="w-full py-4 rounded-2xl text-white font-bold active:scale-98 transition-transform"
          style={{ background: '#00A651', boxShadow: '0 8px 24px #00A65150' }}>
          + Add new address
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={closeForm}>
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto flex flex-col"
            style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 pb-3 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit address' : 'Add address'}</h2>
              <button onClick={closeForm} className="text-gray-400 text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 pb-6 overflow-y-auto">
              <div>
                <label className="text-xs text-gray-500">Label <span className="text-red-500">*</span></label>
                <input type="text" value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Home, Work, Mom's place"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Address <span className="text-red-500">*</span></label>
                <input type="text" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="e.g. 15 Borrowdale Rd, Harare"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Delivery notes (optional)</label>
                <input type="text" value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="e.g. Blue gate, call on arrival"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-red-400" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  style={{ accentColor: '#00A651' }} />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>

              <button type="submit" disabled={save.isPending}
                className="mt-3 py-3.5 rounded-2xl text-white font-bold active:scale-98 transition-transform disabled:opacity-70"
                style={{ background: '#00A651' }}>
                {save.isPending ? 'Saving...' : editId ? 'Save changes' : 'Add address'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
