import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function Match() {
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMatches()
    fetchMatchHistory()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await api.get('/match')
      setMatches(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMatchHistory = async () => {
    try {
      const res = await api.get('/match/history')
      // Filtriraj da ne prikazujemo aktivne matcheve u historiji
      setHistory(res.data.filter(m => !m.isPermanent && new Date(m.expiresAt) <= new Date()))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async (matchId) => {
    try {
      await api.post(`/match/${matchId}/save`)
      fetchMatches()
    } catch (err) {
      console.error(err)
    }
  }

  const formatExpiry = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date()
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${hours}h ${minutes}m`
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
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 hover:text-neutral-700 transition-colors"
        >
          ← Nazad
        </button>
      </nav>

      {/* Main */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-neutral-800 tracking-tight mb-6">Tvoji matchevi</h2>

        {loading ? (
          <p className="text-sm text-stone-400">Učitavam...</p>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xl">
              ⚡
            </div>
            <p className="text-sm font-medium text-neutral-600">Nemaš još matcheva za danas.</p>
            <p className="text-xs text-stone-400">Objavi Spark i pričekaj matching!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-2xl border border-stone-200 p-5">

                {/* Header */}
               
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0 overflow-hidden">
                      {match.matchedProfileImageBase64 ? (
                        <img
                          src={`data:image/jpeg;base64,${match.matchedProfileImageBase64}`}
                          alt={match.matchedUsername}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (match.matchedDisplayName?.[0] || match.matchedUsername[0]).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3
                        onClick={() => navigate(`/user/${match.matchedUsername}`)}
                        className="text-sm font-bold text-neutral-800 cursor-pointer hover:text-orange-500 transition-colors"
                        >
                        {match.matchedDisplayName || match.matchedUsername}
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">@{match.matchedUsername}</p>
                    </div>
                  </div>
                  {match.isPermanent ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-green-50 text-green-600 border border-green-200">
                      Sačuvano
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-500 border border-orange-200">
                      ⏱ {formatExpiry(match.expiresAt)}
                    </span>
                  )}
                </div>

                {/* Njihov Spark */}
                <div className="bg-stone-50 rounded-xl px-4 py-3 mb-3 border border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Njihov Spark</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{match.theirSparkContent}</p>
                </div>

                {/* Zajednički tagovi */}
                {match.commonTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {match.commonTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Akcije */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/chat/${match.id}`)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
                  >
                    💬 Chat
                  </button>
                  {!match.iSaved ? (
                    <button
                      onClick={() => handleSave(match.id)}
                      className="flex-1 bg-stone-50 hover:bg-stone-100 text-neutral-600 text-xs font-semibold py-2.5 rounded-xl border border-stone-200 transition-colors"
                    >
                      ♡ Sačuvaj
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-xl py-2.5">
                      ✓ Sačuvano
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-orange-500 transition-colors mb-3"
            >
              <span className="text-[10px]">{showHistory ? '▲' : '▼'}</span>
              {showHistory ? 'Sakrij povijest' : `Povijest matcheva (${history.length})`}
            </button>

            {showHistory && (
              <div className="space-y-3">
                {history.map((match) => (
                  <div key={match.id} className="bg-white rounded-2xl border border-stone-200 p-5 opacity-75">

                    {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0 overflow-hidden">
                        {match.matchedProfileImageBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${match.matchedProfileImageBase64}`}
                            alt={match.matchedUsername}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (match.matchedDisplayName?.[0] || match.matchedUsername[0]).toUpperCase()
                        )}
                      </div>
                      <div>
                       <h3
                        onClick={() => navigate(`/user/${match.matchedUsername}`)}
                        className="text-sm font-bold text-neutral-800 cursor-pointer hover:text-orange-500 transition-colors"
                      >
                        {match.matchedDisplayName || match.matchedUsername}
                      </h3>
                                              <p className="text-xs text-stone-400 mt-0.5">@{match.matchedUsername}</p>
                      </div>
                    </div>
                       <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-400 border border-stone-200">
                        {new Date(match.matchDate).toLocaleDateString('hr-HR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Njihov Spark */}
                    <div className="bg-stone-50 rounded-xl px-4 py-3 mb-3 border border-stone-100">
                      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-1">Njihov Spark</p>
                      <p className="text-sm text-neutral-700 leading-relaxed">{match.theirSparkContent}</p>
                    </div>

                    {/* Zajednički tagovi */}
                    {match.commonTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {match.commonTags.map((tag) => (
                          <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200">
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
        )}

      </div>
    </div>
  )
}

export default Match