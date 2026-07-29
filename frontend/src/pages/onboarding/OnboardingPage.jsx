import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/useAuthStore'
import { MzayaLockup } from '../../components/brand/MzayaLockup'
import Icon from '../../components/ui/Icon'
import illoCommerce from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-commerce-01.svg'
import illoErrands  from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-errands-02.svg'
import illoDelivery from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-delivery-03.svg'

const SLIDES = [
  {
    image:    illoCommerce,
    title:    'Food, groceries & more',
    subtitle: 'Order from restaurants, supermarkets and hardware stores — all in one app, delivered to your door.',
  },
  {
    image:    illoErrands,
    title:    'Errands, handled',
    subtitle: 'ZIMRA runs, bank queues, document drop-offs — send a Mzaya to stand in line so you don\u2019t have to.',
  },
  {
    image:    illoDelivery,
    title:    'Fast delivery, easy payment',
    subtitle: 'Track your Mzaya in real time. Pay with EcoCash, OneMoney, InnBucks or card — USD and ZiG accepted.',
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
  }, [token, navigate])

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Skip button */}
      <div className="flex justify-end px-6 pt-12">
        <button onClick={skip} className="text-gray-400 text-sm font-medium active:text-gray-600">
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <img src={current.image} alt="" aria-hidden="true"
          className="w-72 max-w-full mb-10 select-none" draggable="false" />
        <h1 className="text-2xl font-black text-gray-900 mb-3 leading-tight">{current.title}</h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xs">{current.subtitle}</p>
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
                i === slide ? 'w-6 h-2' : 'w-2 h-2 bg-gray-200'
              }`}
              style={i === slide ? { background: '#00A651' } : undefined}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-4 rounded-2xl text-sm font-bold text-white active:scale-95 transition-all shadow-lg"
          style={{ background: '#00A651' }}
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
      icon:    'grocery',
      title:   'I want to order',
      desc:    'Browse vendors, place orders, track deliveries',
      color:   'border-green-400 bg-green-50',
      badge:   'bg-green-100 text-green-700',
    },
    {
      role:    'rider',
      icon:    'rider',
      title:   'I want to deliver',
      desc:    'Become a Mzaya — accept delivery jobs and earn money',
      color:   'border-green-500 bg-green-50',
      badge:   'bg-green-100 text-green-700',
    },
    {
      role:    'vendor',
      icon:    'store',
      title:   'I have a business',
      desc:    'List your restaurant, store or business',
      color:   'border-green-400 bg-green-50',
      badge:   'bg-green-100 text-green-700',
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
          {ROLES.map(({ role, icon, title, desc, color }) => (
            <button
              key={role}
              onClick={() => navigate(`/register?role=${role}`)}
              className={`w-full text-left border-2 rounded-2xl p-4 active:scale-98 transition-all ${color}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl"><Icon name={icon} size={26} /></span>
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
