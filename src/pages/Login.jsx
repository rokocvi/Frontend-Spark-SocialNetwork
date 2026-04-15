import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, {
        userId: res.data.userId,
        username: res.data.username,
        displayName: res.data.displayName,
      })
      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri prijavi')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight mb-1">Dobrodošao natrag</h1>
          <p className="text-sm text-stone-400 mb-6">Prijavi se u svoj račun</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition"
                placeholder="pero@test.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Lozinka</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Prijavi se
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="text-center text-sm text-stone-400 mt-5">
          Nemaš račun?{' '}
          <Link to="/register" className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
            Registriraj se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login