/**
 * ============================================================================
 * MZAYA
 * Page: AddressFormPage
 * Path: frontend/src/pages/customer/AddressFormPage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a controlled form for creating or editing a delivery address.
 *
 * Responsibilities
 * ----------------
 * • Display address label, street, area, city and delivery-note fields.
 * • Support default-address selection.
 * • Forward changes and submission to the application layer.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not geocode addresses.
 * • Does not validate service coverage.
 * • Does not persist data.
 * • Does not open a map picker.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { MapPin, Save } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

function InputField({
  id,
  label,
  value,
  placeholder,
  error,
  disabled,
  onChange,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[12px] font-semibold"
        style={{ color: 'var(--mzaya-text-primary)' }}
      >
        {label}
      </label>
      <input
        id={id}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={Boolean(error)}
        className="h-12 w-full rounded-[16px] border bg-white px-4 text-[13px] outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{
          borderColor: error
            ? 'var(--mzaya-error)'
            : 'var(--mzaya-border)',
          color: 'var(--mzaya-text-primary)',
        }}
      />
      {error && (
        <p
          className="mt-2 text-[11px]"
          style={{ color: 'var(--mzaya-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function AddressFormPage({
  mode = 'create',
  values = {},
  errors = {},
  saving = false,
  onBack,
  onChange,
  onOpenMapPicker,
  onSubmit,
}) {
  const update = (field, value) => onChange?.({ ...values, [field]: value })
  const editing = mode === 'edit'

  return (
    <PageShell>
      <AppHeader
        title={editing ? 'Edit address' : 'Add address'}
        subtitle="Add clear delivery details for your mzaya."
        onBack={onBack}
      />

      <main className="mx-auto w-full max-w-2xl px-4 pb-12 pt-4 sm:px-6">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSubmit?.(values)
          }}
          className="rounded-[24px] border bg-white p-5 sm:p-6"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-sm)',
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InputField
              id="address-label"
              label="Address label"
              value={values.label}
              placeholder="Home, work, family..."
              error={errors.label}
              disabled={saving}
              onChange={(value) => update('label', value)}
            />

            <InputField
              id="address-city"
              label="City"
              value={values.city}
              placeholder="Harare"
              error={errors.city}
              disabled={saving}
              onChange={(value) => update('city', value)}
            />
          </div>

          <div className="mt-5">
            <InputField
              id="address-line-1"
              label="Street address"
              value={values.address_line_1 ?? values.addressLine1}
              placeholder="House number and street"
              error={errors.address_line_1 ?? errors.addressLine1}
              disabled={saving}
              onChange={(value) => update('address_line_1', value)}
            />
          </div>

          <div className="mt-5">
            <InputField
              id="address-area"
              label="Suburb or area"
              value={values.area ?? values.suburb}
              placeholder="Borrowdale, CBD, Avondale..."
              error={errors.area ?? errors.suburb}
              disabled={saving}
              onChange={(value) => update('area', value)}
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="address-note"
              className="mb-2 block text-[12px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              Delivery instructions
            </label>
            <textarea
              id="address-note"
              value={values.delivery_note ?? values.deliveryNote ?? ''}
              placeholder="Gate color, landmark, access instructions..."
              rows={4}
              disabled={saving}
              onChange={(event) =>
                update('delivery_note', event.target.value)
              }
              className="w-full resize-none rounded-[16px] border bg-white px-4 py-3 text-[13px] leading-6 outline-none disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              style={{
                borderColor: 'var(--mzaya-border)',
                color: 'var(--mzaya-text-primary)',
              }}
            />
          </div>

          {onOpenMapPicker && (
            <Button
              type="button"
              variant="outline"
              leadingIcon={MapPin}
              onClick={onOpenMapPicker}
              disabled={saving}
              className="mt-5 w-full"
            >
              Confirm location on map
            </Button>
          )}

          <label className="mt-5 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(values.is_default ?? values.isDefault)}
              disabled={saving}
              onChange={(event) =>
                update('is_default', event.target.checked)
              }
              className="h-4 w-4 rounded"
            />
            <span
              className="text-[12px]"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              Make this my default delivery address
            </span>
          </label>

          <Button
            type="submit"
            leadingIcon={Save}
            loading={saving}
            className="mt-6 w-full"
          >
            {editing ? 'Save address' : 'Add address'}
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
