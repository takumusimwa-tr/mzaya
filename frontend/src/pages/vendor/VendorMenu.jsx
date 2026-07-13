import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ImageUpload from '../../components/ImageUpload'
import imageUrl from '../../utils/imageUrl'
import Icon from '../../components/ui/Icon'

export default function VendorMenu() {
  const queryClient = useQueryClient()
  const branchId = useActiveBranch((s) => s.branchId)
  const [showForm,  setShowForm]  = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price_usd: '', category: '', image_url: '', prep_minutes: '' })
  const [error, setError] = useState('')

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn:  () => api.get('/vendors/my', { params: branchId ? { branch_id: branchId } : {} }).then((r) => r.data.vendor),
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const saveItem = useMutation({
    mutationFn: (data) => {
      if (editItem) return api.put(`/vendors/${vendorData.id}/menu/${editItem.id}`, data)
      return api.post(`/vendors/${vendorData.id}/menu`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-vendor'])
      setShowForm(false)
      setEditItem(null)
      setForm({ name: '', description: '', price_usd: '', category: '', image_url: '', prep_minutes: '' })
    },
    onError: (err) => setError(err.response?.data?.error || 'Could not save item'),
  })

  const deleteItem = useMutation({
    mutationFn: (itemId) => api.delete(`/vendors/${vendorData.id}/menu/${itemId}`),
    onSuccess:  () => queryClient.invalidateQueries(['my-vendor']),
  })

  const toggleStock = useMutation({
    mutationFn: ({ itemId, available }) =>
      api.put(`/vendors/${vendorData.id}/menu/${itemId}`, { is_available: available }),
    onSuccess:  () => queryClient.invalidateQueries(['my-vendor']),
  })

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, description: item.description || '', price_usd: item.price_usd, category: item.category || '', image_url: item.image_url || '', prep_minutes: item.prep_minutes || '' })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price_usd) {
      setError('Name and price are required')
      return
    }
    saveItem.mutate({ ...form, price_usd: parseFloat(form.price_usd), prep_minutes: parseInt(form.prep_minutes) || 0 })
  }

  if (isLoading) return <LoadingScreen message="Loading menu..." />

  const menuItems = vendorData?.menuItems || []
  const grouped   = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Menu'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <div className="h-screen overflow-y-auto">
     <div className="w-full pb-10">
      <div className="flex items-center justify-between px-8 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Menu</h1>
        <button
          onClick={() => { setShowForm(true); setEditItem(null); setForm({ name: '', description: '', price_usd: '', category: '', image_url: '', prep_minutes: '' }) }}
          className="bg-[#00A651] text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95"
        >
          + Add item
        </button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end">
          <div className="bg-white rounded-t-3xl w-full max-w-md mx-auto flex flex-col" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-6 pb-3 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? 'Edit item' : 'Add menu item'}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null) }} className="text-gray-400 text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 px-6 pb-6 overflow-y-auto">
              {error && <div className="p-3 bg-red-50 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}
              <ImageUpload
                currentUrl={form.image_url}
                onUploaded={(url) => setForm((f) => ({ ...f, image_url: url }))}
                label="Add food photo"
              />
              <Input label="Item name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Streetwise Two" required />
              <Input label="Description (optional)" name="description" value={form.description} onChange={handleChange} placeholder="e.g. 2 pieces chicken with chips" />
              <Input label="Price (USD)" name="price_usd" type="number" value={form.price_usd} onChange={handleChange} placeholder="e.g. 3.50" required />
              <Input label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Chicken, Burgers, Drinks" />
              <Input label="Prep time (minutes)" name="prep_minutes" type="number" value={form.prep_minutes} onChange={handleChange} placeholder="e.g. 15 — leave 0 if ready immediately" />
              <Button type="submit" size="lg" loading={saveItem.isPending} className="mt-2 bg-[#00A651] hover:bg-[#00873F]">
                {editItem ? 'Save changes' : 'Add to menu'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Menu list */}
      <div className="px-8 flex flex-col gap-6">
        {!menuItems.length ? (
          <div className="text-center py-16">
            <div className="mb-3 flex justify-center text-gray-300"><Icon name="food" size={40} /></div>
            <p className="text-gray-500 text-sm">No menu items yet</p>
            <p className="text-gray-400 text-xs mt-1">Tap + Add item to get started</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{category}</h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => {
                  const outOfStock = item.is_available === false
                  return (
                  <div key={item.id}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                    style={outOfStock ? { opacity: 0.55 } : undefined}>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image_url
                          ? <img src={imageUrl(item.image_url, 300)} alt={item.name} className="w-full h-full object-cover" />
                          : <Icon name="food" size={24} className="opacity-30" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          {outOfStock && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                              Out of stock
                            </span>
                          )}
                        </div>
                        {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-green-600 font-bold">US${Number(item.price_usd).toFixed(2)}</p>
                          {item.prep_minutes > 0 && (
                            <span className="text-[11px] text-gray-400">· ~{item.prep_minutes} min prep</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-1">
                        <button
                          onClick={() => toggleStock.mutate({ itemId: item.id, available: outOfStock })}
                          disabled={toggleStock.isPending}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium active:scale-95 disabled:opacity-50"
                          style={outOfStock
                            ? { background: '#EDFAF3', color: '#00A651' }
                            : { background: '#FFF4E5', color: '#B8860B' }
                          }
                        >
                          {outOfStock ? 'Mark available' : 'Out of stock'}
                        </button>
                        <button
                          onClick={() => openEdit(item)}
                          className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg font-medium active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem.mutate(item.id)}
                          className="text-xs bg-red-50 text-red-500 px-3 py-1.5 rounded-lg font-medium active:scale-95"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
     </div>
    </div>
  )
}
