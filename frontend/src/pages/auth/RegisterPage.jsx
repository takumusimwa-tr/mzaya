import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const ROLE_LABELS = {
  customer: 'Customer account',
  rider:    'Mzaya account',
  vendor:   'Vendor account',
}

const ROLE_COLORS = {
  customer: 'bg-green-600',
  rider:    'bg-[#00A651]',
  vendor:   'bg-[#00A651]',
}

export default function RegisterPage() {
  const navigate      = useNavigate()
  const [params]      = useSearchParams()
  const setAuth       = useAuthStore((s) => s.setAuth)
  const role          = params.get('role') || 'customer'

  const [form, setForm]       = useState({ name: '', phone: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register({ ...form, role })
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const headerColor = ROLE_COLORS[role] || 'bg-green-600'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className={`${headerColor} px-6 pt-16 pb-12`}>
        <button onClick={() => navigate(-1)} className="bg-white/20 p-2 rounded-full mb-4 inline-block">
          <BackIcon />
        </button>
        <h1 className="text-3xl font-bold text-white">Mzaya</h1>
        <p className="text-white/80 mt-1 text-sm">{ROLE_LABELS[role]}</p>
      </div>

      <div className="flex-1 px-6 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">
          Signing up as a <span className="font-semibold capitalize">{role}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
          />
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="07X XXX XXXX"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Min 6 characters"
            required
          />
          <Button type="submit" size="lg" loading={loading} className={`mt-2 ${headerColor}`}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
