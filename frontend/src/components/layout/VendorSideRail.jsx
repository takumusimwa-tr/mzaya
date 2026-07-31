/**
 * ============================================================================
 * MZAYA — VendorSideRail
 * Path: frontend/src/components/layout/VendorSideRail.jsx
 * ----------------------------------------------------------------------------
 * Purpose
 * -------
 * Primary navigation and branch context for the authenticated vendor console.
 *
 * Responsibilities
 * ----------------
 * • Preserve the established vendor routes and role-specific navigation.
 * • Display the active vendor identity and branch selector.
 * • Forward logout, branch selection and add-branch navigation.
 * • Fetch only navigation-level vendor and branch context already owned here.
 *
 * Non-Responsibilities
 * --------------------
 * • Does not fetch page-specific data.
 * • Does not create branches or modify vendor records.
 * • Does not decide authorization; App.jsx route guards remain authoritative.
 *
 * Dependencies
 * ------------
 * React Query, React Router, Zustand auth/branch stores, existing vendor API.
 *
 * Accessibility
 * -------------
 * Navigation has an explicit label, active links use aria-current through
 * NavLink, the branch menu exposes expanded state, and all controls retain a
 * visible keyboard focus ring.
 *
 * Change Log
 * ----------
 * July 2026 — Premium visual refinement; routes and data contracts preserved.
 * ============================================================================
 */

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronDown,
  CirclePlus,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Settings,
  UtensilsCrossed,
} from 'lucide-react'
import api, { vendorAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import useActiveBranch from '../../store/useActiveBranch'
import imageUrl from '../../utils/imageUrl'
import MzayaIcon from '../brand/MzayaIcon'

const TABS = [
  { to: '/vendor', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/vendor/orders', label: 'Orders', icon: ListOrdered },
  { to: '/vendor/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/vendor/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/vendor/settings', label: 'Settings', icon: Settings },
]

export default function VendorSideRail() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)
  const branchId = useActiveBranch((state) => state.branchId)
  const setBranch = useActiveBranch((state) => state.setBranch)

  const { data: vendor } = useQuery({
    queryKey: ['my-vendor', branchId],
    queryFn: () =>
      api
        .get('/vendors/my', {
          params: branchId ? { branch_id: branchId } : {},
        })
        .then((response) => response.data.vendor),
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['my-branches'],
    queryFn: () => vendorAPI.branches().then((response) => response.data.branches),
  })

  const activeBranch =
    branches.find((branch) => branch.id === branchId) ?? branches[0]

  const handleLogout = () => {
    logout?.()
    navigate('/welcome', { replace: true })
  }

  return (
    <aside
      className="flex h-screen w-[92px] shrink-0 flex-col border-r bg-white px-3 py-5 lg:w-[248px] lg:px-4"
      style={{ borderColor: 'var(--mzaya-border)' }}
    >
      <div className="flex items-center justify-center gap-3 px-1 lg:justify-start">
        <MzayaIcon size={42} />
        <div className="hidden min-w-0 lg:block">
          <p
            className="text-[15px] font-semibold tracking-[-0.02em]"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            mzaya
          </p>
          <p
            className="text-[10px] font-medium uppercase tracking-[0.14em]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            Vendor
          </p>
        </div>
      </div>

      {branches.length > 1 ? (
        <BranchSwitcher
          branches={branches}
          active={activeBranch}
          onSelect={setBranch}
          onAddBranch={() => navigate('/vendor/branches/new')}
        />
      ) : (
        <div
          className="mt-5 hidden rounded-[16px] border px-3 py-3 lg:block"
          style={{
            borderColor: 'var(--mzaya-border)',
            background: 'var(--mzaya-surface-subtle)',
          }}
        >
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            Active branch
          </p>
          <p
            className="mt-1 truncate text-[12px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {activeBranch?.branch_name || 'Main'}
          </p>
        </div>
      )}

      <nav className="mt-6 flex flex-1 flex-col gap-1.5" aria-label="Vendor console">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="group flex min-h-14 items-center justify-center gap-3 rounded-[16px] px-3 text-[11px] font-semibold outline-none transition lg:justify-start lg:text-[12px] focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
            style={({ isActive }) => ({
              background: isActive ? 'var(--mzaya-green-50)' : 'transparent',
              color: isActive
                ? 'var(--mzaya-green-800)'
                : 'var(--mzaya-text-secondary)',
            })}
          >
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t pt-4" style={{ borderColor: 'var(--mzaya-border)' }}>
        <div className="mb-3 flex items-center justify-center gap-3 lg:justify-start lg:px-2">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[13px] text-[13px] font-semibold"
            style={{
              background: 'var(--mzaya-green-50)',
              color: 'var(--mzaya-green-800)',
            }}
          >
            {vendor?.logo_url ? (
              <img
                src={imageUrl(vendor.logo_url, 120)}
                alt={`${vendor.name || 'Vendor'} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              vendor?.name?.charAt(0)?.toUpperCase() ||
              user?.name?.charAt(0)?.toUpperCase() ||
              'V'
            )}
          </div>
          <div className="hidden min-w-0 lg:block">
            <p
              className="truncate text-[12px] font-semibold"
              style={{ color: 'var(--mzaya-text-primary)' }}
            >
              {vendor?.name || user?.name || 'Vendor account'}
            </p>
            <p
              className="mt-0.5 truncate text-[10px]"
              style={{ color: 'var(--mzaya-text-secondary)' }}
            >
              {activeBranch?.branch_name || 'Main branch'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-[15px] px-3 text-[11px] font-semibold outline-none transition hover:bg-red-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)] lg:justify-start lg:text-[12px]"
          style={{ color: '#B42318' }}
        >
          <LogOut size={19} strokeWidth={1.8} aria-hidden="true" />
          <span className="hidden lg:inline">Sign out</span>
        </button>
      </div>
    </aside>
  )
}

function BranchSwitcher({ branches, active, onSelect, onAddBranch }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.removeEventListener('pointerdown', closeOnOutsideClick)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative mt-5">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-14 w-full items-center justify-center rounded-[16px] border px-2 outline-none focus-visible:[box-shadow:var(--mzaya-focus-ring)] lg:justify-between lg:px-3"
        style={{
          borderColor: 'var(--mzaya-border)',
          background: 'var(--mzaya-surface-subtle)',
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Change branch. Current branch: ${active?.branch_name || 'Main'}`}
      >
        <div className="hidden min-w-0 text-left lg:block">
          <p
            className="text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            Active branch
          </p>
          <p
            className="mt-1 truncate text-[12px] font-semibold"
            style={{ color: 'var(--mzaya-text-primary)' }}
          >
            {active?.branch_name || 'Main'}
          </p>
        </div>
        <ChevronDown
          size={17}
          strokeWidth={1.8}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'var(--mzaya-text-secondary)' }}
        />
      </button>

      {open ? (
        <div
          className="absolute left-full top-0 z-50 ml-3 w-64 overflow-hidden rounded-[18px] border bg-white py-2 lg:left-0 lg:top-full lg:ml-0 lg:mt-2"
          style={{
            borderColor: 'var(--mzaya-border)',
            boxShadow: 'var(--mzaya-shadow-lg)',
          }}
          role="menu"
        >
          <p
            className="px-4 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--mzaya-text-secondary)' }}
          >
            Your branches
          </p>

          {branches.map((branch) => {
            const selected = active?.id === branch.id
            return (
              <button
                key={branch.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  onSelect(branch.id)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none hover:bg-gray-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              >
                <div className="min-w-0">
                  <p
                    className="truncate text-[12px] font-semibold"
                    style={{ color: 'var(--mzaya-text-primary)' }}
                  >
                    {branch.branch_name || 'Main'}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[10px]"
                    style={{ color: 'var(--mzaya-text-secondary)' }}
                  >
                    {branch.city?.name || 'Location unavailable'}
                    {!branch.is_active ? ' · Pending' : ''}
                  </p>
                </div>
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    background: selected
                      ? 'var(--mzaya-green-600)'
                      : 'transparent',
                    border: selected
                      ? 'none'
                      : '1px solid var(--mzaya-border)',
                  }}
                  aria-hidden="true"
                />
              </button>
            )
          })}

          <div className="mt-1 border-t px-2 pt-2" style={{ borderColor: 'var(--mzaya-border)' }}>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onAddBranch()
              }}
              className="flex w-full items-center gap-2 rounded-[12px] px-2 py-2 text-left text-[11px] font-semibold outline-none hover:bg-gray-50 focus-visible:[box-shadow:var(--mzaya-focus-ring)]"
              style={{ color: 'var(--mzaya-green-800)' }}
            >
              <CirclePlus size={17} strokeWidth={1.8} aria-hidden="true" />
              Add a branch
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
