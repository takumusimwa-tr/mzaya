import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/api'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ImageUpload from '../../components/ImageUpload'
import imageUrl from '../../utils/imageUrl'

export default function VendorMenu() {
  const queryClient = useQueryClient()
  const [showForm,  setShowForm]  = useState(false)
  const [editItem,  setEditItem]  = useState(null)
  const [form, setForm] = useState({ name: '', description: '', price_usd: '', category: '', image_url: '' })
  const [error, setError] = useState('')

  const { data: vendorData, isLoading } = useQuery({
    queryKey: ['my-vendor'],
    queryFn:  () => api.get('/vendors/my').then((r) => r.data.vendor),
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
      setForm({ name: '', description: '', price_usd: '', category: '' })
    },
    onError: (err) => setError(err.response?.data?.error || 'Could not save item'),
  })

  const deleteItem = useMutation({
    mutationFn: (itemId) => api.delete(`/vendors/${vendorData.id}/menu/${itemId}`),
    onSuccess:  () => queryClient.invalidateQueries(['my-vendor']),
  })

  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name, description: item.description || '', price_usd: item.price_usd, category: item.category || '', image_url: item.image_url || '' })
    setShowForm(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price_usd) {
      setError('Name and price are required')
      return
    }
    saveItem.mutate({ ...form, price_usd: parseFloat(form.price_usd) })
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
    <div className="pb-24">
      <div className="flex items-center justify-between px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">Menu</h1>
        <button
          onClick={() => { setShowForm(true); setEditItem(null); setForm({ name: '', description: '', price_usd: '', category: '', image_url: '' }) }}
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95"
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
              <Button type="submit" size="lg" loading={saveItem.isPending} className="mt-2 bg-orange-500 hover:bg-orange-600">
                {editItem ? 'Save changes' : 'Add to menu'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Menu list */}
      <div className="px-4 flex flex-col gap-6">
        {!menuItems.length ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="text-gray-500 text-sm">No menu items yet</p>
            <p className="text-gray-400 text-xs mt-1">Tap + Add item to get started</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{category}</h2>
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image_url
                          ? <img src={imageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                          : <span className="text-2xl opacity-30">🍽️</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{item.description}</p>}
                        <p className="text-orange-500 font-bold mt-1">${Number(item.price_usd).toFixed(2)}</p>
                      </div>
                      <div className="flex gap-2 ml-1">
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
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
