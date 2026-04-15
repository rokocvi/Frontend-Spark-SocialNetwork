import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as signalR from '@microsoft/signalr'
import api from '../services/api'
import useAuthStore from '../store/authStore'

function Chat() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [connected, setConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false) // drugi korisnik tipka
  const bottomRef = useRef(null)
  const connectionRef = useRef(null)
  const isConnectingRef = useRef(false)
  const typingTimeoutRef = useRef(null) // timeout za stop typing

  useEffect(() => {
    fetchMessages()
    //markAsRead()
    setupSignalR()

    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke('LeaveMatch', matchId).catch(() => {})
        connectionRef.current.stop()
        connectionRef.current = null
        isConnectingRef.current = false
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/message/${matchId}`)
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const markAsRead = async () => {
    try {
      await api.put(`/message/${matchId}/read`)
    } catch (err) {
      console.error(err)
    }
  }

  const setupSignalR = async () => {
    if (isConnectingRef.current || connectionRef.current) return
    isConnectingRef.current = true

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7195/hubs/chat', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()

    // Nova poruka
    connection.on('ReceiveMessage', (message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      setIsTyping(false)
      // Označi kao pročitano kroz hub
      connection.invoke('MarkRead', matchId).catch(() => {})
    })

    // Drugi korisnik tipka
    connection.on('UserTyping', () => {
      setIsTyping(true)
    })

    // Drugi korisnik prestao tipkati
    connection.on('UserStoppedTyping', () => {
      setIsTyping(false)
    })

    // Drugi korisnik pročitao poruke — ažuriraj isRead na svim porukama
    connection.on('MessagesRead', () => {
      setMessages(prev =>
        prev.map(m =>
          m.senderUsername === user?.username ? { ...m, isRead: true } : m
        )
      )
    })

    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => setConnected(true))
    connection.onclose(() => {
      setConnected(false)
      connectionRef.current = null
      isConnectingRef.current = false
    })

    try {
      await connection.start()
      await connection.invoke('JoinMatch', matchId)
      await connection.invoke('MarkRead', matchId)
      setConnected(true)
      connectionRef.current = connection
    } catch (err) {
      console.error('SignalR greška:', err)
      isConnectingRef.current = false
    }
  }

  const handleTyping = (e) => {
  setContent(e.target.value)

  if (!connectionRef.current || !connected) return

  connectionRef.current.invoke('Typing', matchId, user?.username).catch(() => {})

  // Poništi prethodni timeout i postavi novi
  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
  
  typingTimeoutRef.current = setTimeout(() => {
    connectionRef.current?.invoke('StopTyping', matchId).catch(() => {})
    setIsTyping(false) // ← dodaj ovo
  }, 2000)
}
  const handleSend = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    // Poništi typing timeout pri slanju
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    connectionRef.current?.invoke('StopTyping', matchId).catch(() => {})

    try {
      if (connectionRef.current && connected) {
        await connectionRef.current.invoke('SendMessage', matchId, content)
      } else {
        await api.post('/message', { matchId, content })
        fetchMessages()
      }
      setContent('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900 flex flex-col">

      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between h-14 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>
        <button
          onClick={() => navigate('/match')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 hover:text-neutral-700 transition-colors"
        >
          ← Nazad
        </button>
      </nav>

      {/* Poruke */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-24 gap-3 text-stone-400">
            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-xl">
              💬
            </div>
            <p className="text-sm">Još nema poruka. Pokreni razgovor!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUsername === user?.username
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center overflow-hidden flex-shrink-0 mb-1">
                    {msg.senderProfileImageBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${msg.senderProfileImageBase64}`}
                        alt={msg.senderUsername}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-bold text-orange-500">
                        {msg.senderUsername[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white text-neutral-800 border border-stone-200 rounded-bl-sm'
                }`}>
                  {!isMe && (
                    <p className="text-[10px] font-semibold text-stone-400 mb-1 uppercase tracking-wide">
                      @{msg.senderUsername}
                    </p>
                  )}
                  <p>{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                    <p className={`text-[10px] ${isMe ? 'text-orange-200' : 'text-stone-400'}`}>
                      {new Date(msg.sentAt).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {/* Pročitano — samo za moje poruke */}
                    {isMe && (
                      <span className={`text-[10px] ${msg.isRead ? 'text-orange-200' : 'text-orange-300'}`}>
                        {msg.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center flex-shrink-0 mb-1">
              <span className="text-[10px] font-bold text-orange-500">...</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-stone-200 px-4 py-3 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-xl mx-auto flex gap-2 items-center">
          <input
            type="text"
            value={content}
            onChange={handleTyping}
            className="flex-1 bg-stone-50 text-neutral-800 placeholder-stone-400 border border-stone-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white transition"
            placeholder="Napiši poruku..."
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center flex-shrink-0 transition-all"
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

export default Chat