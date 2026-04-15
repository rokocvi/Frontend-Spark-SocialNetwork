import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Messages() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchMessages, setMatchMessages] = useState({})

  useEffect(() => {
    fetchMatchesWithMessages()
  }, [])

  const fetchMatchesWithMessages = async () => {
    try {
      const matchRes = await api.get('/match')
      const matches = matchRes.data
      setMatches(matches)

      const messagesData = {}
      for (const match of matches) {
        const msgRes = await api.get(`/message/${match.id}`)
        const msgs = msgRes.data
        const unread = msgs.filter(
          m => m.senderUsername !== user?.username && !m.isRead
        ).length
        const lastMessage = msgs[msgs.length - 1] || null
        messagesData[match.id] = { unread, lastMessage }
      }
      setMatchMessages(messagesData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 hover:text-neutral-700 transition-colors"
        >
          ← Nazad
        </button>
      </nav>

      {/* Main */}
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-xl font-bold text-neutral-800 tracking-tight mb-6">Poruke</h2>

        {loading ? (
          <p className="text-sm text-stone-400">Učitavam...</p>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xl">
              💬
            </div>
            <p className="text-sm font-medium text-neutral-600">Nemaš još matcheva.</p>
            <p className="text-xs text-stone-400">Objavi Spark i pričekaj matching!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match) => {
              const data = matchMessages[match.id]
              const unread = data?.unread || 0
              const lastMsg = data?.lastMessage
              const initital = (match.matchedDisplayName?.[0] || match.matchedUsername[0]).toUpperCase()

              return (
                <div
                  key={match.id}
                  onClick={() => navigate(`/chat/${match.id}`)}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/30 cursor-pointer transition-all p-4 flex items-center gap-4"
                >
                  {/* Avatar */}
                 <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-sm font-bold text-orange-600 flex-shrink-0 overflow-hidden">
                    {match.matchedProfileImageBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${match.matchedProfileImageBase64}`}
                        alt={match.matchedUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initital
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-neutral-800 truncate">
                        {match.matchedDisplayName || match.matchedUsername}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unread > 0 && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                        {match.isPermanent ? (
                          <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                            Permanentno
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-stone-400">
                            ⏱ 24h
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 mb-2">@{match.matchedUsername}</p>

                    {lastMsg ? (
                      <p className="text-xs text-neutral-500 truncate">
                        {lastMsg.senderUsername === user?.username
                          ? <span className="text-stone-400">Ti: </span>
                          : null}
                        {lastMsg.content}
                      </p>
                    ) : (
                      <p className="text-xs text-stone-400 italic">Još nema poruka — pokreni razgovor!</p>
                    )}

                    {match.commonTags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {match.commonTags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-200">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-stone-300 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages