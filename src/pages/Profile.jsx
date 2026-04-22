import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Profile() {
  const navigate = useNavigate()
  const { user, login, token, logout } = useAuthStore()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile')
      const data = res.data
      setDisplayName(data.displayName || '')
      setBio(data.bio || '')
      if (data.profileImageBase64) setProfileImage(data.profileImageBase64)
    } catch {
      setError('Greška pri učitavanju profila.')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [sparkRes, matchRes, matchHistoryRes] = await Promise.all([
        api.get('/spark/history'),
        api.get('/match'),
        api.get('/match/history')
      ])

      const sparkHistory = sparkRes.data
      const activeMatches = matchRes.data
      const matchHistory = matchHistoryRes.data

      // Ukupno sparkova (history + današnji ako postoji)
      const totalSparks = sparkHistory.length

      // Ukupno matcheva (aktivni + istekli iz historije)
      const allMatchIds = new Set([
        ...activeMatches.map(m => m.id),
        ...matchHistory.map(m => m.id)
      ])
      const totalMatches = allMatchIds.size

      // Permanentni matchevi
      const permanentMatches = [...activeMatches, ...matchHistory]
        .filter(m => m.isPermanent).length

      // Najčešći tagovi iz svih sparkova
      const tagCount = {}
      sparkHistory.forEach(s => {
        s.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      })
      const topTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag)

      // Streak — koliko dana zaredom unatrag
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const sparkDates = sparkHistory
        .map(s => {
          const d = new Date(s.sparkDate)
          d.setHours(0, 0, 0, 0)
          return d.getTime()
        })
        .sort((a, b) => b - a)

      for (let i = 0; i < 30; i++) {
        const day = new Date(today)
        day.setDate(today.getDate() - i)
        if (sparkDates.includes(day.getTime())) {
          streak++
        } else {
          break
        }
      }

      setStats({ totalSparks, totalMatches, permanentMatches, topTags, streak })
    } catch {
      setStats(null)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setError('Slika ne smije biti veća od 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    const file = fileInputRef.current?.files[0]
    if (!file) return
    const formData = new FormData()
    formData.append('image', file)
    try {
      setSaving(true)
      setError('')
      const res = await api.post('/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setProfileImage(res.data.profileImageBase64)
      setPreview(null)
      setSuccess('Profilna slika ažurirana! ✓')
      login(token, { ...user, profileImageBase64: res.data.profileImageBase64 })
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri uploadu slike.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.put('/profile', { displayName, bio })
      setSuccess('Profil uspješno ažuriran! ✓')
      login(token, { ...user, displayName, bio })
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri spremanju.')
    } finally {
      setSaving(false)
    }
  }

  const imageSource = preview
    ? preview
    : profileImage
      ? `data:image/jpeg;base64,${profileImage}`
      : null

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <span className="text-stone-400 text-sm">Učitavanje...</span>
      </div>
    )
  }

  const handleDeleteAccount = async () => {

    setSaving(true)
    setError('')
    try{
      await api.delete('/profile')
      logout()
      navigate('/login')
    } catch(err){
      setError(err.response?.data?.message || 'Greška pri brisanju računa.')
      setSaving(false)
      setConfirmDelete(false)
    }
    
  }

 return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 transition-colors"
        >
          ← Nazad
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">

        {error && (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {/* Profile image card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-5">
            Profilna slika
          </h2>
          <div className="flex items-center gap-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center cursor-pointer overflow-hidden group flex-shrink-0"
            >
              {imageSource ? (
                <img src={imageSource} alt="Profilna" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl select-none">
                  {(displayName || user?.username || '?')[0].toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold">Promijeni</span>
              </div>
            </div>
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
              <p className="text-xs text-stone-400 mb-3">JPG, PNG ili WEBP · max 2MB</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 border border-stone-200 hover:bg-stone-100 transition-colors"
                >
                  Odaberi sliku
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sprema...' : 'Spremi sliku'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistike */}
        {stats && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-5">
              Statistike
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-stone-50 rounded-xl border border-stone-100 p-3 text-center">
                <p className="text-xl font-bold text-orange-500">{stats.totalSparks}</p>
                <p className="text-[10px] font-medium text-stone-400 mt-0.5">Sparkova</p>
              </div>
              <div className="bg-stone-50 rounded-xl border border-stone-100 p-3 text-center">
                <p className="text-xl font-bold text-orange-500">{stats.totalMatches}</p>
                <p className="text-[10px] font-medium text-stone-400 mt-0.5">Matcheva</p>
              </div>
              <div className="bg-stone-50 rounded-xl border border-stone-100 p-3 text-center">
                <p className="text-xl font-bold text-orange-500">{stats.permanentMatches}</p>
                <p className="text-[10px] font-medium text-stone-400 mt-0.5">Sačuvanih</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-orange-600">Streak</p>
                <p className="text-[10px] text-orange-400 mt-0.5">Uzastopnih dana sa Sparkom</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🔥</span>
                <span className="text-xl font-bold text-orange-500">{stats.streak}</span>
              </div>
            </div>
            {stats.topTags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5">
                  Tvoji najčešći tagovi
                </p>
                <div className="flex flex-wrap gap-2">
                  {stats.topTags.map((tag, i) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        i === 0
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-orange-50 text-orange-600 border-orange-200'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Profile info card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-5">
            Podatci profila
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                Korisničko ime
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full bg-stone-100 text-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                Prikazno ime
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={100}
                placeholder="Kako želiš da te drugi vide?"
                className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                rows={3}
                placeholder="Kratko o sebi..."
                className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white resize-none transition"
              />
              <p className="mt-1 text-xs text-stone-400 text-right">{bio.length}/300</p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-3 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {saving ? 'Sprema...' : 'Spremi promjene'}
            </button>
          </form>
        </div>

        {/* Brisanje računa */}
        <div className="bg-white rounded-2xl border border-red-100 p-6">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-2">
            Opasna zona
          </h2>
          <p className="text-xs text-stone-400 mb-4">
            Brisanjem računa trajno se brišu svi tvoji podaci, Sparkovi i matchevi. Ova radnja je nepovratna.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Obriši račun
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-red-500">
                Jesi li siguran? Ova radnja se ne može poništiti.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Brisanje...' : 'Da, obriši račun'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 transition-colors"
                >
                  Odustani
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile