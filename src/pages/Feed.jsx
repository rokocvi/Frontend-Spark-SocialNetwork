import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Feed() {
  const navigate = useNavigate()
  const [sparks, setSparks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeed()
  }, [])

  const fetchFeed = async () => {
    try {
      const res = await api.get('/spark/all')
      setSparks(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr)
    const minutes = Math.floor(diff / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    if (minutes < 1) return 'upravo sad'
    if (minutes < 60) return `prije ${minutes} min`
    if (hours < 24) return `prije ${hours}h`
    return `prije ${Math.floor(hours / 24)} dana`
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

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-800 tracking-tight">Feed ⚡</h2>
          <span className="text-xs text-stone-400">{sparks.length} Sparkova danas</span>
        </div>

        {loading ? (
          <p className="text-sm text-stone-400">Učitavam...</p>
        ) : sparks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xl">
              ⚡
            </div>
            <p className="text-sm font-medium text-neutral-600">Nema Sparkova za danas.</p>
            <p className="text-xs text-stone-400">Budi prvi koji će objaviti!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sparks.map((spark) => (
              <div key={spark.id} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400" />
                  <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                    {timeAgo(spark.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-neutral-800 leading-relaxed mb-3">
                  {spark.content}
                </p>
                {spark.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {spark.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed