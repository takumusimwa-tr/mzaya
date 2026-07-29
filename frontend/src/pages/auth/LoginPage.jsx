import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/api'
import useAuthStore from '../../store/useAuthStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { MzayaLockup } from '../../components/brand/MzayaLockup'
import commerceArt from '../../assets/brand/illustrations/onboarding/mzaya-onboarding-commerce-01.svg'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try { const { data } = await authAPI.login(form); setAuth(data.user, data.token); navigate('/') }
    catch (err) { setError(err.response?.data?.error || 'Login failed') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen bg-[#F7FAF8]">
      <section className="relative bg-gradient-to-br from-[#00A651] to-[#007D3D] px-6 pt-12 pb-24 overflow-hidden rounded-b-[38px]">
        <div className="absolute -right-20 -top-12 w-64 h-64 rounded-full bg-white/10" />
        <MzayaLockup iconSize={54} onDark tagline className="relative h-16" />
        <p className="relative text-white/80 mt-3 text-sm">Zimbabwe's all-in-one delivery and commerce platform.</p>
        <img src={commerceArt} alt="" aria-hidden="true" className="absolute right-2 -bottom-16 w-52 rounded-[26px] shadow-xl hidden min-[390px]:block" />
      </section>
      <section className="relative -mt-12 mx-4 bg-white rounded-[28px] p-6 shadow-[0_18px_50px_rgba(7,27,51,.13)]">
        <h1 className="text-2xl font-extrabold text-[#071B33]">Welcome back</h1><p className="text-sm text-gray-500 mt-1 mb-6">Continue where you left off.</p>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl"><p className="text-sm text-red-600">{error}</p></div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4"><Input label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="07X XXX XXXX" required /><Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" required /><Button type="submit" size="lg" loading={loading} className="mt-2 shadow-[0_10px_24px_rgba(0,166,81,.22)]">Login</Button></form>
        <p className="text-center text-sm text-gray-500 mt-6">Don't have an account? <Link to="/register" className="text-green-700 font-bold">Sign up</Link></p>
      </section>
      <p className="text-center text-xs text-gray-400 px-6 py-7">Fast. Trusted. Built for Zimbabwe.</p>
    </div>
  )
}
