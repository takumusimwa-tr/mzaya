/**
 * ============================================================================
 * MZAYA
 * Page: EditProfilePage
 * Path: frontend/src/pages/customer/EditProfilePage.jsx
 * ----------------------------------------------------------------------------
 *
 * Purpose
 * -------
 * Provides a controlled customer-profile editing form.
 *
 * Responsibilities
 * ----------------
 * • Display editable name, email and phone fields.
 * • Surface validation messages supplied by the application layer.
 * • Forward field changes and submission to the parent.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not validate identity or verify contact details.
 * • Does not upload profile images.
 * • Does not persist changes.
 * • Does not normalize backend errors.
 *
 * Security and Privacy
 * --------------------
 * Only collect profile fields that are required by the product. Never display
 * authentication credentials, recovery codes or sensitive identity documents.
 *
 * Change Log
 * ----------
 * July 2026 — Premium UI Integration: initial page composition.
 * ============================================================================
 */

import { Save } from 'lucide-react'
import AppHeader from '../../components/layout/AppHeader'
import PageShell from '../../components/layout/PageShell'
import Button from '../../components/ui/Button'

function Field({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  autoComplete,
  disabled,
  error,
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
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-12 w-full rounded-[16px] border bg-white px-4 text-[13px] outline-none disabled:cursor-not-allowed disabled:opacity-60 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
        style={{
          borderColor: error
            ? 'var(--mzaya-error)'
            : 'var(--mzaya-border)',
          color: 'var(--mzaya-text-primary)',
        }}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-[11px]"
          style={{ color: 'var(--mzaya-error)' }}
        >
          {error}
        </p>
      )}
    </div>
  )
}

export default function EditProfilePage({
  values = {},
  errors = {},
  saving = false,
  disabled = false,
  onBack,
  onChange,
  onSubmit,
}) {
  const update = (field, value) => onChange?.({ ...values, [field]: value })

  return (
    <PageShell>
      <AppHeader
        title="Edit profile"
        subtitle="Keep your account details up to date."
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
            <Field
              id="profile-first-name"
              label="First name"
              value={values.first_name ?? values.firstName}
              autoComplete="given-name"
              disabled={disabled || saving}
              error={errors.first_name ?? errors.firstName}
              onChange={(value) => update('first_name', value)}
            />

            <Field
              id="profile-last-name"
              label="Last name"
              value={values.last_name ?? values.lastName}
              autoComplete="family-name"
              disabled={disabled || saving}
              error={errors.last_name ?? errors.lastName}
              onChange={(value) => update('last_name', value)}
            />
          </div>

          <div className="mt-5">
            <Field
              id="profile-email"
              label="Email address"
              type="email"
              value={values.email}
              autoComplete="email"
              disabled={disabled || saving}
              error={errors.email}
              onChange={(value) => update('email', value)}
            />
          </div>

          <div className="mt-5">
            <Field
              id="profile-phone"
              label="Mobile number"
              type="tel"
              value={values.phone ?? values.mobile}
              autoComplete="tel"
              disabled={disabled || saving}
              error={errors.phone ?? errors.mobile}
              onChange={(value) => update('phone', value)}
            />
          </div>

          <p
            className="mt-5 text-[11px] leading-5"
            style={{ color: 'var(--mzaya-text-muted)' }}
          >
            Changes to your email address or mobile number may require
            verification before they become active.
          </p>

          <Button
            type="submit"
            leadingIcon={Save}
            loading={saving}
            disabled={disabled}
            className="mt-6 w-full"
          >
            Save changes
          </Button>
        </form>
      </main>
    </PageShell>
  )
}
