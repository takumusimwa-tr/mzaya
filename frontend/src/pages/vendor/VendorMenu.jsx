/**
 * ============================================================================
 * MZAYA
 * Page: VendorMenu
 * Path: frontend/src/pages/vendor/VendorMenu.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Manages the current branch's sellable menu catalogue.
 *
 * Preserved Integration
 * ---------------------
 * • GET /vendors/my
 * • POST /vendors/:vendorId/menu
 * • PUT /vendors/:vendorId/menu/:itemId
 * • DELETE /vendors/:vendorId/menu/:itemId
 * • React Query key: ['my-vendor', branchId]
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: premium catalogue layout and canonical
 * menu-item card extraction.
 * ============================================================================
 */

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, UtensilsCrossed, X } from 'lucide-react'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import LoadingScreen from '../../components/ui/LoadingScreen'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import ImageUpload from '../../components/ImageUpload'
import VendorEmptyState from '../../components/vendor/VendorEmptyState'
import VendorMenuItemCard from '../../components/vendor/VendorMenuItemCard'

const EMPTY_FORM = {
  name: '',
  description: '',
  price_usd: '',
  category: '',
  image_url: '',
  prep_minutes: '',
}

export default function VendorMenu() {
  const queryClient = useQueryClient()
  const branchId = useActiveBranch((state) => state.branchId)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  const {
    data: vendorData,
    isLoading,
    isError,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn: () =>
      api
        .get('/vendors/my', {
          params: branchId ? { branch_id: branchId } : {},
        })
        .then((response) => response.data.vendor),
  })

  const invalidateVendor = () =>
    queryClient.invalidateQueries({ queryKey: ['my-vendor'] })

  const saveItem = useMutation({
    mutationFn: (data) => {
      if (editItem) {
        return api.put(
          `/vendors/${vendorData.id}/menu/${editItem.id}`,
          data
        )
      }
      return api.post(`/vendors/${vendorData.id}/menu`, data)
    },
    onSuccess: () => {
      invalidateVendor()
      closeForm()
    },
    onError: (requestError) =>
      setError(requestError.response?.data?.error || 'Could not save item'),
  })

  const deleteItem = useMutation({
    mutationFn: (itemId) =>
      api.delete(`/vendors/${vendorData.id}/menu/${itemId}`),
    onSuccess: invalidateVendor,
  })

  const toggleStock = useMutation({
    mutationFn: ({ itemId, available }) =>
      api.put(`/vendors/${vendorData.id}/menu/${itemId}`, {
        is_available: available,
      }),
    onSuccess: invalidateVendor,
  })

  const menuItems = useMemo(() => vendorData?.menuItems || [], [vendorData])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return menuItems
    return menuItems.filter((item) =>
      [item.name, item.description, item.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized))
    )
  }, [menuItems, query])

  const grouped = useMemo(
    () =>
      filtered.reduce((groups, item) => {
        const category = item.category || 'Menu'
        groups[category] ||= []
        groups[category].push(item)
        return groups
      }, {}),
    [filtered]
  )

  function openCreate() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({
      name: item.name || '',
      description: item.description || '',
      price_usd: item.price_usd ?? '',
      category: item.category || '',
      image_url: item.image_url || '',
      prep_minutes: item.prep_minutes || '',
    })
    setError('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.name.trim() || form.price_usd === '') {
      setError('Name and price are required')
      return
    }

    const parsedPrice = Number.parseFloat(form.price_usd)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError('Enter a valid price')
      return
    }

    saveItem.mutate({
      ...form,
      name: form.name.trim(),
      price_usd: parsedPrice,
      prep_minutes: Number.parseInt(form.prep_minutes, 10) || 0,
    })
  }

  if (isLoading) return <LoadingScreen message="Loading menu..." />

  if (isError || !vendorData) {
    return (
      <div className="h-screen overflow-y-auto px-6 py-8">
        <VendorEmptyState
          icon={UtensilsCrossed}
          title="Menu unavailable"
          message={
            loadError?.response?.data?.error ||
            'We could not load this branch’s catalogue.'
          }
          actionLabel="Try again"
          onAction={refetch}
        />
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-y-auto"
      style={{ background: 'var(--mzaya-background)' }}
    >
      <main className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--mzaya-primary)' }}
            >
              Catalogue
            </p>
            <h1
              className="mt-2 text-[28px] font-semibold tracking-[-0.04em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Menu
            </h1>
            <p
              className="mt-2 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Keep products, pricing and availability accurate.
            </p>
          </div>

          <Button leadingIcon={Plus} onClick={openCreate}>
            Add item
          </Button>
        </header>

        <div className="relative mt-6 max-w-xl">
          <Search
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--mzaya-text-muted)' }}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search menu items"
            className="h-12 w-full rounded-[17px] border bg-white pl-11 pr-4 text-[12px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{
              borderColor: 'var(--mzaya-border)',
              color: 'var(--mzaya-text-primary)',
              boxShadow: 'var(--mzaya-shadow-sm)',
            }}
          />
        </div>

        <section className="mt-7 space-y-8" aria-label="Menu catalogue">
          {!menuItems.length ? (
            <VendorEmptyState
              icon={UtensilsCrossed}
              title="Your menu is empty"
              message="Add the first product customers can order from this branch."
              actionLabel="Add item"
              onAction={openCreate}
            />
          ) : !filtered.length ? (
            <VendorEmptyState
              icon={Search}
              title="No matching items"
              message="Try another product name, description or category."
              compact
            />
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <section key={category} aria-labelledby={`category-${category}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    id={`category-${category}`}
                    className="text-[12px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {category}
                  </h2>
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--mzaya-text-muted)' }}
                  >
                    {items.length} item{items.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {items.map((item) => (
                    <VendorMenuItemCard
                      key={item.id}
                      item={item}
                      busy={
                        toggleStock.isPending || deleteItem.isPending
                      }
                      onToggleAvailability={(selectedItem, unavailable) =>
                        toggleStock.mutate({
                          itemId: selectedItem.id,
                          available: unavailable,
                        })
                      }
                      onEdit={openEdit}
                      onDelete={(selectedItem) =>
                        deleteItem.mutate(selectedItem.id)
                      }
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </section>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vendor-menu-form-title"
        >
          <div
            className="flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-[28px] bg-white sm:rounded-[28px]"
            style={{ boxShadow: 'var(--mzaya-shadow-xl)' }}
          >
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: 'var(--mzaya-border)' }}
            >
              <div>
                <h2
                  id="vendor-menu-form-title"
                  className="text-[19px] font-semibold"
                  style={{ color: 'var(--mzaya-text-primary)' }}
                >
                  {editItem ? 'Edit item' : 'Add menu item'}
                </h2>
                <p
                  className="mt-1 text-[10px]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Customer-visible product information
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-[13px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                style={{
                  background: 'var(--mzaya-surface-muted)',
                  color: 'var(--mzaya-text-secondary)',
                }}
                aria-label="Close form"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 overflow-y-auto px-6 py-5"
            >
              {error && (
                <div
                  className="rounded-[14px] px-4 py-3 text-[12px]"
                  style={{
                    background: 'var(--mzaya-error-soft)',
                    color: 'var(--mzaya-error)',
                  }}
                >
                  {error}
                </div>
              )}

              <ImageUpload
                currentUrl={form.image_url}
                onUploaded={(url) =>
                  setForm((current) => ({ ...current, image_url: url }))
                }
                label="Add product photo"
              />

              <Input label="Item name" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Description" name="description" value={form.description} onChange={handleChange} />
              <Input label="Price (USD)" name="price_usd" type="number" step="0.01" min="0" value={form.price_usd} onChange={handleChange} required />
              <Input label="Category" name="category" value={form.category} onChange={handleChange} />
              <Input label="Preparation time (minutes)" name="prep_minutes" type="number" min="0" value={form.prep_minutes} onChange={handleChange} />

              <Button
                type="submit"
                size="lg"
                loading={saveItem.isPending}
                className="w-full"
              >
                {editItem ? 'Save changes' : 'Add to menu'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
