/**
 * ============================================================================
 * MZAYA
 * Page: VendorOnboarding
 * Path: frontend/src/pages/vendor/VendorOnboarding.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Registers a new vendor and its first branch through the existing backend.
 *
 * Responsibilities
 * ----------------
 * • Fetches supported cities.
 * • Owns and validates the registration form.
 * • Submits vendorAPI.register(form).
 * • Updates the authenticated user's local role after successful submission.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not upload brand assets or opening hours because those fields are not
 *   part of the current registration contract.
 * • Does not invent save-and-resume or verification workflows.
 *
 * Integration Contract
 * --------------------
 * Form payload: name, category, city_id, address, phone, description,
 * branch_name.
 *
 * Change Log
 * ----------
 * July 2026 — Premium guided onboarding refactor preserving one-step API.
 * ============================================================================
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Building2,
  Hammer,
  MapPin,
  ShoppingBasket,
  UtensilsCrossed,
} from 'lucide-react'
import { cityAPI, vendorAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import VendorApplicationSuccess from '../../components/vendor/VendorApplicationSuccess'
import VendorFormSection from '../../components/vendor/VendorFormSection'
import VendorStatusBanner from '../../components/vendor/VendorStatusBanner'

const CATEGORIES = [
  { id: 'food', label: 'Food / Restaurant', icon: UtensilsCrossed },
  { id: 'grocery', label: 'Grocery / Store', icon: ShoppingBasket },
  { id: 'materials', label: 'Building Materials', icon: Hammer },
]

export default function VendorOnboarding() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)

  const [form, setForm] = useState({
    name: '',
    category: 'food',
    city_id: '',
    address: '',
    phone: user?.phone || '',
    description: '',
    branch_name: 'Main',
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

    if (!form.name.trim()) return setError('Enter your business name')
    if (!form.city_id) return setError('Select your city')
    if (!form.address.trim()) return setError('Enter your address')
    if (!form.phone.trim()) return setError('Enter a contact phone')

    setStatus('submitting')
    try {
      await vendorAPI.register(form)
      if (user && setAuth) {
        setAuth(
          { ...user, role: 'vendor' },
          useAuthStore.getState().token
        )
      }
      setStatus('pending')
    } catch (requestError) {
      setStatus('')
      setError(
        requestError.response?.data?.error ||
          'Could not submit your application'
      )
    }
  }

  if (status === 'pending') {
    return (
      <VendorApplicationSuccess
        eyebrow="Application received"
        title="Your business is under review"
        message="Once approved, you can complete your menu and begin receiving customer orders."
        actionLabel="Go to vendor dashboard"
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
        <div className="mx-auto max-w-4xl px-5 py-6 sm:px-8">
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
              <Building2 size={22} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.16em]"
                style={{ color: 'var(--mzaya-primary)' }}
              >
                Vendor registration
              </p>
              <h1
                className="mt-2 text-[28px] font-semibold tracking-[-0.04em]"
                style={{ color: 'var(--mzaya-text-primary)' }}
              >
                Sell on Mzaya
              </h1>
              <p
                className="mt-2 max-w-xl text-[12px] leading-6"
                style={{ color: 'var(--mzaya-text-muted)' }}
              >
                Register your business and first location. Your application will
                be reviewed before the store goes live.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-7 sm:px-8">
        <form onSubmit={submit} className="space-y-4">
          {error && <VendorStatusBanner tone="error" message={error} />}
          {citiesError && (
            <VendorStatusBanner
              tone="error"
              message="Cities could not be loaded. Refresh before submitting."
            />
          )}

          <VendorFormSection
            title="Business type"
            description="Choose the category that best represents what customers will order."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                const active = form.category === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setField('category', category.id)}
                    aria-pressed={active}
                    className="rounded-[18px] border p-4 text-left outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
                    style={{
                      borderColor: active
                        ? 'var(--mzaya-primary)'
                        : 'var(--mzaya-border)',
                      background: active
                        ? 'var(--mzaya-primary-soft)'
                        : 'var(--mzaya-surface)',
                    }}
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      style={{
                        color: active
                          ? 'var(--mzaya-primary)'
                          : 'var(--mzaya-text-muted)',
                      }}
                    />
                    <p
                      className="mt-4 text-[12px] font-semibold"
                      style={{ color: 'var(--mzaya-text-primary)' }}
                    >
                      {category.label}
                    </p>
                  </button>
                )
              })}
            </div>
          </VendorFormSection>

          <VendorFormSection
            title="Business information"
            description="Tell us how the business should appear in the vendor system."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                name="business-name"
                label="Business name"
                value={form.name}
                onChange={(value) => setField('name', value)}
                placeholder="e.g. Chicken Inn"
                required
              />
              <Field
                name="branch-name"
                label="Branch name"
                value={form.branch_name}
                onChange={(value) => setField('branch_name', value)}
                placeholder="e.g. CBD, Borrowdale"
              />
              <Field
                name="contact-phone"
                label="Contact phone"
                value={form.phone}
                onChange={(value) => setField('phone', value)}
                placeholder="07X XXX XXXX"
                required
              />
              <div>
                <label
                  htmlFor="vendor-city"
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  City *
                </label>
                <select
                  id="vendor-city"
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
                name="business-address"
                label="Street address"
                value={form.address}
                onChange={(value) => setField('address', value)}
                placeholder="Business location"
                required
                className="sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <label
                  htmlFor="business-description"
                  className="text-[11px] font-medium"
                  style={{ color: 'var(--mzaya-text-secondary)' }}
                >
                  Description
                </label>
                <textarea
                  id="business-description"
                  value={form.description}
                  onChange={(event) =>
                    setField('description', event.target.value)
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
              Accurate branch details help Mzayas collect orders from the right
              location after approval.
            </p>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || citiesLoading || citiesError}
            className="w-full rounded-[16px] py-4 text-[12px] font-semibold text-white outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={{ background: 'var(--mzaya-primary)' }}
          >
            {status === 'submitting'
              ? 'Submitting application…'
              : 'Submit application'}
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
