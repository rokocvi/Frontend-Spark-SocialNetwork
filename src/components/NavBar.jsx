import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function NavBar({ profileImage, unreadCount, onLogout, onRunMatching }) {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-3 sm:px-6 flex items-center justify-between h-14">
      
      {/* Logo */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest hidden sm:block">beta</span>
      </div>

      {/* Navigacija — sredina */}
      <div className="flex items-center gap-0 sm:gap-1">
        <button onClick={() => navigate('/home')} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-orange-500 hover:bg-orange-50 transition-colors" title="Početna">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        </button>

        <button onClick={() => navigate('/match')} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors" title="Matchevi">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </button>

        <button onClick={() => navigate('/feed')} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors" title="Feed">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h8v8H3zm0 10h8v8H3zM13 3h8v8h-8zm0 10h8v8h-8z"/></svg>
        </button>

        <button onClick={() => navigate('/messages')} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors" title="Poruke">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button onClick={onRunMatching} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-orange-50 hover:text-orange-500 transition-colors" title="Pokreni matching">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
        </button>

        <button onClick={() => navigate('/assistant')} className="relative w-9 sm:w-12 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:bg-stone-100 hover:text-orange-500 transition-colors" title="AI Asistent">
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18 2.5 2.5 0 0 0 10 15.5 2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5 2.5 2.5 0 0 0-2.5-2.5z"/></svg>
        </button>
      </div>

      {/* Profil + odjava */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/literature')}
          className="hidden sm:block px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-400 hover:text-orange-500 hover:bg-stone-100 transition-colors"
          title="Literatura"
        >
          Literatura
        </button>

        <button onClick={() => navigate('/profile')} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center overflow-hidden hover:border-orange-400 transition-colors flex-shrink-0" title={`@${user?.username}`}>
          {profileImage ? (
            <img src={`data:image/jpeg;base64,${profileImage}`} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-orange-500">{(user?.username || '?')[0].toUpperCase()}</span>
          )}
        </button>

        <button onClick={onLogout} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-stone-400 transition-colors" title="Odjava">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </nav>
  )
}

export default NavBar