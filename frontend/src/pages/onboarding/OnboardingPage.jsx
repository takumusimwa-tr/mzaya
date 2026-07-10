import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { MzayaLockup } from '../../components/brand/MzayaLockup'

const SLIDES = [
  {
    emoji:    '🍽️',
    title:    'Food, groceries & more',
    subtitle: 'Order from restaurants, supermarkets, hardware stores — all in one app. Delivered to your door.',
    bg:       'from-green-500 to-green-700',
  },
  {
    emoji:    '🏍️',
    title:    'Fast delivery across Zimbabwe',
    subtitle: 'Riders in Harare, Bulawayo and Mutare ready to deliver. Track your order in real time.',
    bg:       'from-blue-500 to-blue-700',
  },
  {
    emoji:    '💸',
    title:    'Pay with EcoCash & more',
    subtitle: 'EcoCash, OneMoney, InnBucks, ZIPIT, Visa and Mastercard all accepted. USD and ZiG supported.',
    bg:       'from-orange-500 to-orange-600',
  },
]

export default function OnboardingPage() {
  const navigate    = useNavigate()
  const token       = useAuthStore((s) => s.token)
  const [slide, setSlide] = useState(0)
  const [showRoles, setShowRoles] = useState(false)

  // If already logged in skip onboarding
  useEffect(() => {
    if (token) navigate('/', { replace: true })
  }, [token])

  const next = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1)
    } else {
      setShowRoles(true)
    }
  }

  const skip = () => setShowRoles(true)

  if (showRoles) return <RoleSelection navigate={navigate} />

  const current = SLIDES[slide]

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br ${current.bg} transition-all duration-500`}>
      {/* Skip button */}
      <div className="flex justify-end px-6 pt-12">
        <button onClick={skip} className="text-white/70 text-sm font-medium">
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-8xl mb-8 animate-bounce">{current.emoji}</div>
        <h1 className="text-2xl font-bold text-white mb-4 leading-tight">{current.title}</h1>
        <p className="text-white/80 text-base leading-relaxed">{current.subtitle}</p>
      </div>

      {/* Dots + button */}
      <div className="px-6 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${
                i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full bg-white py-4 rounded-2xl text-sm font-bold text-gray-900 active:scale-95 transition-all shadow-lg"
        >
          {slide < SLIDES.length - 1 ? 'Next' : 'Get started'}
        </button>
      </div>
    </div>
  )
}

// ─── Role selection screen ────────────────────────────────────────────────────
function RoleSelection({ navigate }) {
  const ROLES = [
    {
      role:    'customer',
      emoji:   '🛒',
      title:   'I want to order',
      desc:    'Browse vendors, place orders, track deliveries',
      color:   'border-green-400 bg-green-50',
      badge:   'bg-green-100 text-green-700',
    },
    {
      role:    'rider',
      emoji:   '🏍️',
      title:   'I want to deliver',
      desc:    'Accept delivery jobs and earn money',
      color:   'border-blue-400 bg-blue-50',
      badge:   'bg-blue-100 text-blue-700',
    },
    {
      role:    'vendor',
      emoji:   '🏪',
      title:   'I have a business',
      desc:    'List your restaurant, store or business',
      color:   'border-orange-400 bg-orange-50',
      badge:   'bg-orange-100 text-orange-700',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-16 pb-10 flex flex-col items-center" style={{ background: '#00A651' }}>
        <MzayaLockup iconSize={56} stacked tagline onDark />
        <p className="text-white/75 text-sm mt-2">Zimbabwe's delivery platform</p>
      </div>

      <div className="flex-1 px-6 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">How will you use Mzaya?</h2>
        <p className="text-sm text-gray-500 mb-6">Choose your role to get started</p>

        <div className="flex flex-col gap-3">
          {ROLES.map(({ role, emoji, title, desc, color, badge }) => (
            <button
              key={role}
              onClick={() => navigate(`/register?role=${role}`)}
              className={`w-full text-left border-2 rounded-2xl p-4 active:scale-98 transition-all ${color}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  )
}
