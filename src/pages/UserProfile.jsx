import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'

function UserProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profile/${username}`)
      setProfile(res.data)
    } catch {
      setError('Korisnik nije pronađen.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <span className="text-stone-400 text-sm">Učitavanje...</span>
      </div>
    )
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
          onClick={() => navigate(-1)}
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

        {profile && (
          <>
            {/* Profil card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile.profileImageBase64 ? (
                    <img
                      src={`data:image/jpeg;base64,${profile.profileImageBase64}`}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-orange-400">
                      {(profile.displayName || profile.username)[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">
                    {profile.displayName || profile.username}
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">@{profile.username}</p>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-5 pt-5 border-t border-stone-100">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Bio</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfile