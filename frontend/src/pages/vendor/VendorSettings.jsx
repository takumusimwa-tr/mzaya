/**
 * ============================================================================
 * MZAYA
 * Page: VendorSettings
 * Path: frontend/src/pages/vendor/VendorSettings.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Edits the selected vendor branch's customer-facing profile and opening hours.
 *
 * Responsibilities
 * ----------------
 * • Fetches the active branch through GET /vendors/my.
 * • Seeds and owns the editable form state.
 * • Persists supported fields through PUT /vendors/:vendorId.
 * • Navigates to the existing add-branch route.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not invent verification, banking, tax or delivery-radius contracts.
 * • Does not auto-save; changes are submitted explicitly.
 *
 * Integration Contract
 * --------------------
 * Query key: ['my-vendor', branchId]
 * Mutation payload: name, description, phone, address, logo_url, cover_url,
 * opening_hours.
 *
 * Accessibility
 * -------------
 * Uses labelled controls, semantic sections, live feedback and visible focus.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI refactor with reusable form and hours components.
 * ============================================================================
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import api from '../../api/api'
import useActiveBranch from '../../store/useActiveBranch'
import ImageUpload from '../../components/ImageUpload'
import LoadingScreen from '../../components/ui/LoadingScreen'
import VendorBranchCard from '../../components/vendor/VendorBranchCard'
import VendorFormSection from '../../components/vendor/VendorFormSection'
import VendorHoursEditor, {
  DEFAULT_VENDOR_HOURS,
  VENDOR_DAYS,
} from '../../components/vendor/VendorHoursEditor'
import VendorStatusBanner from '../../components/vendor/VendorStatusBanner'

export default function VendorSettings() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const branchId = useActiveBranch((state) => state.branchId)
  const [form, setForm] = useState(null)
  const [hours, setHours] = useState({})
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const {
    data: vendor,
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

  useEffect(() => {
    if (!vendor) return

    setForm({
      name: vendor.name || '',
      description: vendor.description || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      logo_url: vendor.logo_url || null,
      cover_url: vendor.cover_url || null,
    })

    const seededHours = {}
    for (const day of VENDOR_DAYS) {
      seededHours[day.key] = {
        ...DEFAULT_VENDOR_HOURS,
        ...(vendor.opening_hours?.[day.key] || {}),
      }
    }
    setHours(seededHours)
  }, [vendor])

  const saveMutation = useMutation({
    mutationFn: (patch) => api.put(`/vendors/${vendor.id}`, patch),
    onSuccess: () => {
      setSaved(true)
      setError('')
      queryClient.invalidateQueries({ queryKey: ['my-vendor'] })
      window.setTimeout(() => setSaved(false), 2200)
    },
    onError: (requestError) =>
      setError(requestError.response?.data?.error || 'Could not save settings'),
  })

  function updateField(key, value) {
    setSaved(false)
    setForm((current) => ({ ...current, [key]: value }))
  }

  function updateDay(dayKey, patch) {
    setSaved(false)
    setHours((current) => ({
      ...current,
      [dayKey]: { ...current[dayKey], ...patch },
    }))
  }

  function save() {
    setError('')
    if (!form.name.trim()) {
      setError('Business name is required')
      return
    }
    saveMutation.mutate({ ...form, opening_hours: hours })
  }

  if (isLoading || (!form && !isError)) {
    return <LoadingScreen message="Loading settings..." />
  }

  if (isError || !vendor || !form) {
    return (
      <div className="h-screen overflow-y-auto px-5 py-8 sm:px-8">
        <VendorStatusBanner
          tone="error"
          title="Settings unavailable"
          message={
            loadError?.response?.data?.error ||
            'We could not load this branch’s business settings.'
          }
        />
        <button
          type="button"
          onClick={refetch}
          className="mt-4 rounded-[14px] px-4 py-3 text-[11px] font-semibold text-white"
          style={{ background: 'var(--mzaya-primary)' }}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-y-auto"
      style={{ background: 'var(--mzaya-background)' }}
    >
      <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.16em]"
              style={{ color: 'var(--mzaya-primary)' }}
            >
              Business management
            </p>
            <h1
              className="mt-2 text-[28px] font-semibold tracking-[-0.04em]"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Settings
            </h1>
            <p
              className="mt-2 text-[12px]"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              Manage what customers see and when this branch accepts orders.
            </p>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-[15px] px-5 py-3.5 text-[12px] font-semibold text-white outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ background: 'var(--mzaya-primary)' }}
          >
            <Save size={16} strokeWidth={1.8} aria-hidden="true" />
            {saveMutation.isPending ? 'Saving…' : 'Save settings'}
          </button>
        </header>

        <div className="mt-6 space-y-4">
          {error && <VendorStatusBanner tone="error" message={error} />}
          {saved && (
            <VendorStatusBanner
              tone="success"
              title="Settings saved"
              message="Your latest branch information is now active."
            />
          )}

          <VendorBranchCard
            onAddBranch={() => navigate('/vendor/branches/new')}
          />

          <VendorFormSection
            title="Brand presentation"
            description="These images help customers recognise your business across Mzaya."
          >
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div>
                <p
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Cover image
                </p>
                <ImageUpload
                  currentUrl={form.cover_url}
                  onUploaded={(url) => updateField('cover_url', url)}
                  label="Upload cover"
                  shape="wide"
                />
              </div>
              <div>
                <p
                  className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: 'var(--mzaya-text-muted)' }}
                >
                  Business logo
                </p>
                <div className="max-w-[180px]">
                  <ImageUpload
                    currentUrl={form.logo_url}
                    onUploaded={(url) => updateField('logo_url', url)}
                    label="Upload logo"
                    shape="circle"
                  />
                </div>
              </div>
            </div>
          </VendorFormSection>

          <VendorFormSection
            title="Business details"
            description="Customer-facing details for the active branch."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <VendorField
                label="Business name"
                name="vendor-name"
                value={form.name}
                onChange={(value) => updateField('name', value)}
                required
              />
              <VendorField
                label="Contact phone"
                name="vendor-phone"
                value={form.phone}
                onChange={(value) => updateField('phone', value)}
                placeholder="07X XXX XXXX"
              />
              <VendorField
                label="Address"
                name="vendor-address"
                value={form.address}
                onChange={(value) => updateField('address', value)}
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label
                  htmlFor="vendor-description"
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  Description
                </label>
                <textarea
                  id="vendor-description"
                  value={form.description}
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  rows={4}
                  placeholder="Short description customers will see"
                  className="mt-2 w-full resize-none rounded-[15px] border bg-white px-4 py-3 text-[12px] leading-5 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    color: 'var(--mzaya-text-primary)',
                  }}
                />
              </div>
            </div>
          </VendorFormSection>

          <VendorFormSection
            title="Opening hours"
            description="The branch opens and closes automatically from this schedule. Use Pause orders on the dashboard when closing early."
          >
            <VendorHoursEditor hours={hours} onDayChange={updateDay} />
          </VendorFormSection>

          <button
            type="button"
            onClick={save}
            disabled={saveMutation.isPending}
            className="w-full rounded-[16px] py-4 text-[12px] font-semibold text-white outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ background: 'var(--mzaya-primary)' }}
          >
            {saveMutation.isPending ? 'Saving settings…' : 'Save settings'}
          </button>
        </div>
      </main>
    </div>
  )
}

function VendorField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-[11px] font-medium"
        style={{ color: 'var(--mzaya-text-secondary)' }}
      >
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={name}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 h-12 w-full rounded-[15px] border bg-white px-4 text-[12px] outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{
          borderColor: 'var(--mzaya-border)',
          color: 'var(--mzaya-text-primary)',
        }}
      />
    </div>
  )
}
