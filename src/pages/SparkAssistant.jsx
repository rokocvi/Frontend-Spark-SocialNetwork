import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function SparkAssistant() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('assistant-messages')
    return saved ? JSON.parse(saved) : []
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [userContext, setUserContext] = useState(null)

  useEffect(() => {
    fetchUserContext()
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('assistant-messages', JSON.stringify(messages))
    }
  }, [messages])

  const fetchUserContext = async () => {
    try {
      const [sparkRes, matchRes, matchHistoryRes, profileRes] = await Promise.all([
        api.get('/spark/history'),
        api.get('/match'),
        api.get('/match/history'),
        api.get('/profile')
      ])

      const sparkHistory = sparkRes.data
      const activeMatches = matchRes.data
      const matchHistory = matchHistoryRes.data
      const profile = profileRes.data

      // Izračunaj streak
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
        if (sparkDates.includes(day.getTime())) streak++
        else break
      }

      // Najčešći tagovi
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

      // Ukupno matcheva
      const allMatchIds = new Set([
        ...activeMatches.map(m => m.id),
        ...matchHistory.map(m => m.id)
      ])
      const totalMatches = allMatchIds.size
      const permanentMatches = [...activeMatches, ...matchHistory]
        .filter(m => m.isPermanent).length

      const context = {
        username: user?.username,
        displayName: profile.displayName,
        bio: profile.bio,
        totalSparks: sparkHistory.length,
        topTags,
        totalMatches,
        permanentMatches,
        streak,
        activeMatches: activeMatches.length
      }

      setUserContext(context)

      // Postavi početnu poruku samo ako nema već poruka iz localStorage
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: `Bok ${profile.displayName || user?.username}! Ja sam tvoj Spark asistent. Vidim da imaš ${sparkHistory.length} Sparkova i ${totalMatches} matcheva do sad${streak > 0 ? `, a streak ti je ${streak} dana 🔥` : ''}. Kako ti mogu pomoći? ⚡`
        }])
      }

    } catch (err) {
      console.error(err)
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: 'Bok! Ja sam Spark asistent. Možeš me pitati bilo što o aplikaciji. ⚡'
        }])
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const buildSystemPrompt = () => {
    const base = `Ti si personalizirani AI asistent Spark aplikacije. Govoriš hrvatski jezik. Obraćaš se korisniku po imenu i koristiš njegove osobne podatke za personalizirane savjete.

Spark je socijalna mreža gdje korisnici svaki dan objavljuju kratki post koji se zove "Spark" s tagovima koji opisuju što ih zanima taj dan.

Kako aplikacija funkcionira:
- Korisnik svaki dan objavi jedan Spark (max 280 znakova) s tagovima
- Algoritam uspoređuje tagove svih korisnika i spaja one s zajedničkim interesima
- Spojeni korisnici dobiju 24-satni chat (match)
- Ako oboje kliknu "Sačuvaj" na matchu, postaje permanentan i chat ostaje zauvijek
- Korisnik može pokrenuti matching klikom na gumb "Pokreni matching"

Stranice aplikacije:
- Home — objava dnevnog Sparka
- Matchevi — pregled aktivnih i prošlih matcheva  
- Poruke — pregled svih chatova
- Feed — anonimni pregled današnjih Sparkova svih korisnika
- Profil — uređivanje profila, profilna slika, bio, statistike

Savjeti za dobre matcheve:
- Koristi specifične tagove (npr. "gitara" umjesto "glazba")
- Objavljuj Spark svaki dan za bolji streak
- Što više tagova, veća šansa za match

Odgovaraj kratko i prijateljski. Ako te pitaju nešto što nije vezano za Spark aplikaciju, ljubazno reci da možeš pomoći samo s pitanjima o Sparku.`

    if (!userContext) return base

    const personal = `

PODACI O KORISNIKU S KOJIM RAZGOVARAŠ:
- Username: @${userContext.username}
- Prikazno ime: ${userContext.displayName || 'nije postavljeno'}
- Bio: ${userContext.bio || 'nije postavljeno'}
- Ukupno Sparkova: ${userContext.totalSparks}
- Najčešći tagovi: ${userContext.topTags.length > 0 ? userContext.topTags.map(t => '#' + t).join(', ') : 'nema još'}
- Ukupno matcheva: ${userContext.totalMatches}
- Permanentnih matcheva: ${userContext.permanentMatches}
- Trenutni streak: ${userContext.streak} dana
- Aktivnih matcheva trenutno: ${userContext.activeMatches}

Koristi ove podatke za personalizirane savjete. Na primjer, ako korisnik ima malo matcheva, predloži mu specifičnije tagove. Ako ima dobar streak, pohvali ga.`

    return base + personal
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 500,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...updatedMessages.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      })

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.choices[0].message.content
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Došlo je do greške. Pokušaj ponovo.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const suggestedQuestions = [
    'Kako poboljšati matcheve?',
    'Što misliš o mom profilu?',
    'Koji tagovi su dobri za mene?',
    'Kako povećati streak?'
  ]

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <span className="text-stone-400 text-sm">Učitavam tvoj profil...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between h-14 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              localStorage.removeItem('assistant-messages')
              setMessages([])
              fetchUserContext()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            Očisti chat
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            ← Nazad
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-800">Spark Asistent</p>
            <p className="text-xs text-stone-400">Personalizirani savjetnik za tvoj profil</p>
          </div>
        </div>
      </div>

      {/* Poruke */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mb-1">
                  <span className="text-white text-xs">⚡</span>
                </div>
              )}
              <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-white text-neutral-800 border border-stone-200 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </div>

            {i === 0 && (
              <div className="flex flex-wrap gap-2 mt-3 ml-9">
                {suggestedQuestions.map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mb-1">
              <span className="text-white text-xs">⚡</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-stone-200 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-xl mx-auto flex gap-2 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition disabled:opacity-50"
            placeholder="Postavi pitanje..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default SparkAssistant