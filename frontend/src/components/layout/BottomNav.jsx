import { Heart, Home, ListOrdered, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/home',
    label: 'Home',
    icon: Home,
    end: true,
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: ListOrdered,
    end: false,
  },
  {
    to: '/favorites',
    label: 'Favorites',
    icon: Heart,
    end: true,
  },
  {
    to: '/profile',
    label: 'Account',
    icon: UserRound,
    end: true,
  },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary navigation"
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md border-t border-[#E2E8E3] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl"
      style={{ boxShadow: '0 -8px 28px rgba(16, 44, 36, 0.055)' }}
    >
      <div className="grid h-[68px] grid-cols-4 px-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              [
                'group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl',
                'outline-none transition-colors duration-150 ease-out',
                'focus-visible:ring-2 focus-visible:ring-[#136B57] focus-visible:ring-offset-2',
                isActive
                  ? 'text-[#136B57]'
                  : 'text-[#7A847E] hover:text-[#3F4B45]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span
                  aria-hidden="true"
                  className={[
                    'absolute top-0 h-[2px] w-6 rounded-full bg-[#136B57]',
                    'transition-all duration-200 ease-out',
                    isActive ? 'scale-x-100 opacity-100' : 'scale-x-50 opacity-0',
                  ].join(' ')}
                />

                <Icon
                  aria-hidden="true"
                  size={21}
                  strokeWidth={isActive ? 2.15 : 1.8}
                  className="transition-transform duration-150 ease-out group-active:scale-95"
                />

                <span
                  className={[
                    'max-w-full truncate text-[11px] leading-4 tracking-[-0.01em]',
                    isActive ? 'font-semibold' : 'font-medium',
                  ].join(' ')}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
