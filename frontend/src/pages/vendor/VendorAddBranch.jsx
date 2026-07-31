/**
 * ============================================================================
 * MZAYA
 * Page: VendorAddBranch
 * Path: frontend/src/pages/vendor/VendorAddBranch.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Adds a new location under the authenticated vendor's existing brand.
 *
 * Responsibilities
 * ----------------
 * • Fetches supported cities.
 * • Validates and submits vendorAPI.addBranch(form).
 * • Invalidates the existing ['my-branches'] query after success.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not approve, activate or select the new branch.
 * • Does not invent branch editing or geocoding behavior.
 *
 * Integration Contract
 * --------------------
 * Form payload: branch_name, city_id, address, phone.
 *
 * Change Log
 * ----------
 * July 2026 — Premium branch-creation refactor preserving current API.
 * ============================================================================
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Store } from 'lucide-react'
import { cityAPI, vendorAPI } from '../../api/api'
import VendorApplicationSuccess from '../../components/vendor/VendorApplicationSuccess'
import VendorFormSection from '../../components/vendor/VendorFormSection'
import VendorStatusBanner from '../../components/vendor/VendorStatusBanner'

export default function VendorAddBranch() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    branch_name: '',
    city_id: '',
    address: '',
    phone: '',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const {
    data: cities,
    isLoading: citiesLoading,
    isError: citiesError,
  } = useQuery({
    queryKey: ['cities'],
    queryFn: () => cityAPI.list().then((response) => response.data.cities),
  })

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    setError('')

    if (!form.branch_name.trim()) return setError('Enter a branch name')
    if (!form.city_id) return setError('Select a city')
    if (!form.address.trim()) return setError('Enter the address')
    if (!form.phone.trim()) return setError('Enter a contact phone')

    setStatus('submitting')
    try {
      await vendorAPI.addBranch(form)
      queryClient.invalidateQueries({ queryKey: ['my-branches'] })
      setStatus('done')
    } catch (requestError) {
      setStatus('')
      setError(
        requestError.response?.data?.error || 'Could not add branch'
      )
    }
  }

  if (status === 'done') {
    return (
      <VendorApplicationSuccess
        eyebrow="Branch submitted"
        title="Your new location was added"
        message="The branch remains pending until approved. Once approved, it will appear in the branch switcher and can receive orders."
        actionLabel="Back to vendor dashboard"
        onAction={() => navigate('/vendor')}
      />
    )
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--mzaya-background)' }}
    >
      <header
        className="border-b"
        style={{
          borderColor: 'var(--mzaya-border)',
          background: 'var(--mzaya-surface)',
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-[12px] px-2 py-2 text-[11px] font-semibold outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
            Back
          </button>

          <div className="mt-6 flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px]"
              style={{
                background: 'var(--mzaya-primary-soft)',
                color: 'var(--mzaya-primary)',
              }}
            >
              <Store size={22} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--mzaya-primary)' }}
              >
                Branch management
              </p>
              <h1
                className="mt-2 text-[28px] font-semibold tracking-[-0.04em]"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Add a branch
              </h1>
              <p
                className="mt-2 text-[12px] leading-6"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Register another physical location under your existing business.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-7 sm:px-8">
        <form onSubmit={submit} className="space-y-4">
          {error && <VendorStatusBanner tone="error" message={error} />}
          {citiesError && (
            <VendorStatusBanner
              tone="error"
              message="Cities could not be loaded. Refresh before submitting."
            />
          )}

          <VendorFormSection
            title="Location details"
            description="Use details that distinguish this location from your other branches."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="branch-name"
                label="Branch name"
                value={form.branch_name}
                onChange={(value) => setField('branch_name', value)}
                placeholder="e.g. Borrowdale, Bulawayo"
                required
              />

              <div>
                <label
                  htmlFor="branch-city"
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  City *
                </label>
                <select
                  id="branch-city"
                  value={form.city_id}
                  onChange={(event) => setField('city_id', event.target.value)}
                  disabled={citiesLoading || citiesError}
                  required
                  className="mt-2 h-12 w-full rounded-[15px] border bg-white px-4 text-[12px] outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                  style={{
                    borderColor: 'var(--mzaya-border)',
                    color: 'var(--mzaya-text-primary)',
                  }}
                >
                  <option value="">
                    {citiesLoading ? 'Loading cities…' : 'Select city'}
                  </option>
                  {cities?.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                name="branch-address"
                label="Street address"
                value={form.address}
                onChange={(value) => setField('address', value)}
                placeholder="Physical collection address"
                required
                className="sm:col-span-2"
              />

              <Field
                name="branch-phone"
                label="Contact phone"
                value={form.phone}
                onChange={(value) => setField('phone', value)}
                placeholder="07X XXX XXXX"
                required
                className="sm:col-span-2"
              />
            </div>
          </VendorFormSection>

          <div
            className="flex items-start gap-3 rounded-[18px] border px-4 py-4"
            style={{
              borderColor: 'var(--mzaya-border)',
              background: 'var(--mzaya-surface)',
            }}
          >
            <MapPin
              className="mt-0.5 shrink-0"
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              style={{ color: 'var(--mzaya-primary)' }}
            />
            <p
              className="text-[11px] leading-5"
              style={{ color: 'var(--mzaya-text-muted)' }}
            >
              This location will stay pending until approved. Approval and
              branch activation remain controlled by the existing backend.
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || citiesLoading || citiesError}
            className="w-full rounded-[16px] py-4 text-[12px] font-semibold text-white outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ background: 'var(--mzaya-primary)' }}
          >
            {status === 'submitting' ? 'Adding branch…' : 'Add branch'}
          </button>
        </form>
      </main>
    </div>
  )
}

function Field({
  name,
  label,
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
        {required && ' *'}
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
