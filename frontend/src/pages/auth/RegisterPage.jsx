import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function RegisterPage() {
  const navigate  = useNavigate()
  const setAuth   = useAuthStore((s) => s.setAuth)
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
      const { data } = await authAPI.register({ ...form, role: 'customer' })
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-green-600 px-6 pt-16 pb-12">
        <h1 className="text-3xl font-bold text-white">Mzaya</h1>
        <p className="text-green-100 mt-1 text-sm">Zimbabwe's delivery platform</p>
      </div>

      <div className="flex-1 px-6 pt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-6">Start ordering in minutes</p>

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
            placeholder="Takudzwa Moyo"
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
          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
