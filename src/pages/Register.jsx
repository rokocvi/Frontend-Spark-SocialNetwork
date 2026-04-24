import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
    bio: '',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const newErrors = {}

    if (!form.username.trim())
      newErrors.username = 'Username je obavezan.'
    else if (form.username.length < 3)
      newErrors.username = 'Username mora imati najmanje 3 znaka.'
    else if (form.username.length > 50)
      newErrors.username = 'Username ne smije imati više od 50 znakova.'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      newErrors.username = 'Username smije sadržavati samo slova, brojeve i _.'

    if (!form.email.trim())
      newErrors.email = 'Email je obavezan.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Email nije ispravan.'

    if (!form.password)
      newErrors.password = 'Lozinka je obavezna.'
    else if (form.password.length < 6)
      newErrors.password = 'Lozinka mora imati najmanje 6 znakova.'

    if (form.displayName && form.displayName.length > 100)
      newErrors.displayName = 'Ime ne smije imati više od 100 znakova.'

    if (form.bio && form.bio.length > 300)
      newErrors.bio = 'Bio ne smije imati više od 300 znakova.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    try {
      const res = await api.post('/auth/register', form)
      login(res.data.token, {
        userId: res.data.userId,
        username: res.data.username,
        displayName: res.data.displayName,
      })
      navigate('/home')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Greška pri registraciji')
    }
  }

  const inputClass = (field) =>
    `w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:bg-white transition ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
        : 'border-stone-200 focus:border-orange-400 focus:ring-orange-100'
    }`

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h1 className="text-xl font-bold text-neutral-800 tracking-tight mb-1">Kreiraj račun</h1>
          <p className="text-sm text-stone-400 mb-6">Pridruži se Spark zajednici</p>

          {serverError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={inputClass('username')}
                placeholder="pero_test"
              />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass('email')}
                placeholder="pero@test.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Lozinka</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass('password')}
                placeholder="••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">
                Ime i prezime <span className="text-stone-300 font-normal">(opcionalno)</span>
              </label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className={inputClass('displayName')}
                placeholder="Pero Perić"
              />
              {errors.displayName && <p className="mt-1 text-xs text-red-500">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 mb-1.5">
                Bio <span className="text-stone-300 font-normal">(opcionalno)</span>
              </label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className={inputClass('bio')}
                placeholder="Nešto o sebi..."
                rows={3}
              />
              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
            >
              Registriraj se
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-400 mt-5">
          Već imaš račun?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:text-orange-600 transition-colors">
            Prijavi se
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register