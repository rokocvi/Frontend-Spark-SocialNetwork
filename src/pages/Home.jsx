import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'
import * as signalR from '@microsoft/signalr'

function Home() {
  const navigate = useNavigate()
  const { user, logout, token } = useAuthStore()
  const [spark, setSpark] = useState(null)
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [profileImage, setProfileImage] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [newMatchNotification, setNewMatchNotification] = useState(false)
  const connectionRef = useRef(null)
  const isConnectingRef = useRef(false)


  useEffect(() => {
    fetchTodaySpark()
    fetchUnreadCount()
    fetchProfileImage()
    fetchSparkHistory()
    setupNotifications()

    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop()
        connectionRef.current = null
      }
    }
  }, [])

  const fetchTodaySpark = async () => {
    try {
      const res = await api.get('/spark/today')
      setSpark(res.data)
    } catch {
      setSpark(null)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const matchRes = await api.get('/match')
      const matches = matchRes.data
      let total = 0
      for (const match of matches) {
        const msgRes = await api.get(`/message/${match.id}`)
        const unread = msgRes.data.filter(
          m => m.senderUsername !== user?.username && !m.isRead
        )
        total += unread.length
      }
      setUnreadCount(total)
    } catch {
      setUnreadCount(0)
    }
  }

  const fetchProfileImage = async () => {
    try {
      const res = await api.get('/profile')
      setProfileImage(res.data.profileImageBase64)
    } catch {
      setProfileImage(null)
    }
  }

  const fetchSparkHistory = async () => {
    try {
      const res = await api.get('/spark/history')
      setHistory(res.data)
    } catch {
      setHistory([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '')
      await api.post('/spark', { content, tags: tagsArray })
      setSuccess('Spark objavljen! ⚡')
      setContent('')
      setTags('')
      fetchTodaySpark()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleRunMatching = async () => {
    setError('')
    setSuccess('')
    if (!spark) {
      setError('Objavi Spark prije pokretanja matchinga!')
      return
    }
    try {
      await api.post('/match/run')
      setSuccess('Matching pokrenut! Provjeri svoje matcheve ⚡')
      fetchUnreadCount()
    } catch (err) {
      setError(err.response?.data?.message || 'Greška pri pokretanju matchinga')
    }
  }

   const setupNotifications = async () => {
    if (isConnectingRef.current || connectionRef.current) return

    isConnectingRef.current = true

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7195/hubs/chat', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()

    connection.on('NewMatch', () => {
      setNewMatchNotification(true)
      fetchUnreadCount()
    })

    try {
      await connection.start()
      await connection.invoke('JoinUserGroup')
      connectionRef.current = connection
    } catch (err) {
      console.error('SignalR greška:', err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">

      
      {/* Navbar */}
<nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between h-14">
  
  {/* Logo — lijevo */}
  <div className="flex items-center gap-2">
    <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
  </div>

  {/* Navigacija — sredina */}
  <div className="flex items-center gap-1">

    {/* Home */}
    <button
      onClick={() => navigate('/home')}
      className="relative w-12 h-10 flex items-center justify-center rounded-xl text-orange-500 hover:bg-orange-50 transition-colors"
      title="Početna"
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
      </svg>
    </button>

    {/* Matchevi */}
    <button
      onClick={() => navigate('/match')}
      className="relative w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors"
      title="Matchevi"
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </button>

    {/* Feed */}
    <button
      onClick={() => navigate('/feed')}
      className="relative w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors"
      title="Feed"
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z"/>
      </svg>
    </button>

    {/* Poruke */}
    <button
      onClick={() => navigate('/messages')}
      className="relative w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors"
      title="Poruke"
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>

    {/* Matching */}
    <button
      onClick={handleRunMatching}
      className="relative w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-orange-50 hover:text-orange-500 transition-colors"
      title="Pokreni matching"
    >
      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
      </svg>
    </button>

    <button
  onClick={() => navigate('/assistant')}
  className="relative w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors"
  title="AI Asistent"
>
  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/>
  </svg>
</button>

  </div>


  <div className="flex items-center gap-2">
    <button
      onClick={() => navigate('/profile')}
      className="w-9 h-9 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center overflow-hidden hover:border-orange-400 transition-colors flex-shrink-0"
      title={`@${user?.username}`}
    >
      {profileImage ? (
        <img
          src={`data:image/jpeg;base64,${profileImage}`}
          alt="Profil"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm font-bold text-orange-500">
          {(user?.username || '?')[0].toUpperCase()}
        </span>
      )}
    </button>

    <button
      onClick={handleLogout}
      className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-stone-400 transition-colors"
      title="Odjava"
    >
      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
    </button>
  </div>

</nav>

      {/* Hero illustration */}
      <div className="w-full overflow-hidden border-b border-orange-100" style={{ background: '#fff7ed', height: '160px' }}>
        <svg viewBox="0 0 680 160" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <style>{`
              .ring1 { animation: ringPulse 3s ease-in-out infinite; transform-origin: 340px 80px; }
              .ring2 { animation: ringPulse 3s ease-in-out infinite 0.6s; transform-origin: 340px 80px; }
              .ring3 { animation: ringPulse 3s ease-in-out infinite 1.2s; transform-origin: 340px 80px; }
              @keyframes ringPulse {
                0%, 100% { opacity: 0.35; transform: scale(1); }
                50% { opacity: 0.65; transform: scale(1.04); }
              }
              .bolt-glow { animation: boltPulse 2s ease-in-out infinite; transform-origin: 340px 80px; }
              @keyframes boltPulse {
                0%, 100% { opacity: 0.15; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.1); }
              }
              .dash-left { animation: dashMove 3s linear infinite; }
              .dash-right { animation: dashMove 3s linear infinite reverse; }
              @keyframes dashMove {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: -40; }
              }
              .tag1 { animation: tagFloat 4s ease-in-out infinite; }
              .tag2 { animation: tagFloat 4s ease-in-out infinite 1s; }
              .tag3 { animation: tagFloat 4s ease-in-out infinite 2s; }
              .tag4 { animation: tagFloat 4s ease-in-out infinite 3s; }
              @keyframes tagFloat {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-4px); }
              }
              .user-left { animation: userBob 4s ease-in-out infinite; transform-origin: 90px 80px; }
              .user-right { animation: userBob 4s ease-in-out infinite 2s; transform-origin: 590px 80px; }
              @keyframes userBob {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-3px); }
              }
            `}</style>
          </defs>
          <rect width="680" height="160" fill="#fff7ed"/>
          <circle cx="340" cy="80" r="130" fill="none" stroke="#fed7aa" strokeWidth="0.75" className="ring1"/>
          <circle cx="340" cy="80" r="95" fill="none" stroke="#fdba74" strokeWidth="0.75" className="ring2"/>
          <circle cx="340" cy="80" r="58" fill="none" stroke="#fb923c" strokeWidth="0.75" className="ring3"/>
          <circle cx="340" cy="80" r="44" fill="#f97316" className="bolt-glow"/>
          <g className="user-left">
            <circle cx="90" cy="80" r="38" fill="#fff" stroke="#fed7aa" strokeWidth="1"/>
            <circle cx="90" cy="80" r="28" fill="#fff7ed" stroke="#fed7aa" strokeWidth="0.75"/>
            <circle cx="90" cy="72" r="10" fill="#fdba74"/>
            <path d="M72 92 Q90 82 108 92" fill="#fdba74"/>
          </g>
          <g className="user-right">
            <circle cx="590" cy="80" r="38" fill="#fff" stroke="#fed7aa" strokeWidth="1"/>
            <circle cx="590" cy="80" r="28" fill="#fff7ed" stroke="#fed7aa" strokeWidth="0.75"/>
            <circle cx="590" cy="72" r="10" fill="#fdba74"/>
            <path d="M572 92 Q590 82 608 92" fill="#fdba74"/>
          </g>
          <path d="M130 80 Q220 46 305 75" fill="none" stroke="#fdba74" strokeWidth="1" strokeDasharray="4 5" className="dash-left"/>
          <path d="M375 85 Q460 114 550 80" fill="none" stroke="#fdba74" strokeWidth="1" strokeDasharray="4 5" className="dash-right"/>
          <circle cx="340" cy="80" r="32" fill="#fff" stroke="#f97316" strokeWidth="1.5"/>
          <polygon points="344,64 334,78 342,78 336,96 350,80 342,80" fill="#f97316"/>
          <g className="tag1">
            <rect x="155" y="38" width="58" height="20" rx="10" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
            <text x="184" y="52" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="#c2410c">#glazba</text>
          </g>
          <g className="tag2">
            <rect x="448" y="30" width="50" height="20" rx="10" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
            <text x="473" y="44" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="#c2410c">#sport</text>
          </g>
          <g className="tag3">
            <rect x="210" y="112" width="46" height="20" rx="10" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
            <text x="233" y="126" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="#c2410c">#kava</text>
          </g>
          <g className="tag4">
            <rect x="404" y="110" width="58" height="20" rx="10" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
            <text x="433" y="124" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="600" fill="#c2410c">#coding</text>
          </g>
          <circle cx="155" cy="112" r="3" fill="#fdba74" opacity="0.5"/>
          <circle cx="520" cy="48" r="3" fill="#fdba74" opacity="0.5"/>
          <circle cx="278" cy="34" r="2.5" fill="#fb923c" opacity="0.3"/>
          <circle cx="408" cy="132" r="2.5" fill="#fb923c" opacity="0.3"/>
          <circle cx="30" cy="38" r="10" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
          <circle cx="650" cy="128" r="8" fill="#fff" stroke="#fed7aa" strokeWidth="0.75"/>
        </svg>
      </div>

      {/* Main */}
      <div className="max-w-xl mx-auto px-4 py-10">

        {newMatchNotification && (
          <div
            onClick={() => { setNewMatchNotification(false); navigate('/match') }}
            className="mb-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium cursor-pointer hover:bg-orange-100 transition-colors flex items-center justify-between"
          >
            <span>⚡ Imaš novi match! Provjeri matcheve.</span>
            <span className="text-orange-400 text-xs">Klikni →</span>
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
            {success}
          </div>
        )}

        {spark ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest">Tvoj današnji Spark</span>
            </div>
            <p className="text-neutral-800 text-base leading-relaxed mb-4">{spark.content}</p>
            {spark.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {spark.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="mt-5 pt-5 border-t border-stone-100">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-orange-500 transition-colors"
                >
                  <span className="text-[10px]">{showHistory ? '▲' : '▼'}</span>
                  {showHistory ? 'Sakrij povijest' : `Prethodnih Sparkova (${history.length})`}
                </button>

                {showHistory && (
                  <div className="mt-4 space-y-3">
                    {history.map((s) => (
                      <div key={s.id} className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                          {new Date(s.sparkDate).toLocaleDateString('hr-HR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <p className="text-neutral-700 text-sm leading-relaxed mt-1.5">{s.content}</p>
                        {s.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {s.tags.map((tag) => (
                              <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-500 border border-orange-100">
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
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-bold text-neutral-800 mb-5 tracking-tight">Što te danas zanima? ⚡</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white resize-none transition"
                placeholder="Tražim nekoga za jam session na gitari..."
                rows={3}
                maxLength={280}
              />

              <div>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition"
                  placeholder="Tagovi: gitara, glazba, jam"
                />
                <p className="mt-1.5 text-xs text-stone-400">Tagovi se koriste za spajanje s drugim korisnicima</p>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-semibold py-3 rounded-xl text-sm transition-all"
              >
                Objavi Spark ⚡
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home