import { useNavigate } from 'react-router-dom'

function Literature() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50 text-neutral-900">

      <nav className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500 tracking-tight">Spark</span>
          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">beta</span>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 border border-stone-200 hover:bg-stone-100 transition-colors"
        >
          Nazad
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-xl font-bold text-neutral-800 tracking-tight">Literatura i izvori</h1>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-4">Frontend</h2>
          <div className="space-y-3">
            <a href="https://react.dev" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">React</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://reactrouter.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">React Router</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://tailwindcss.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Tailwind CSS</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://zustand-demo.pmnd.rs" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Zustand</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://axios-http.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Axios</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://platform.openai.com/docs" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">OpenAI API</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-4">Backend</h2>
          <div className="space-y-3">
            <a href="https://learn.microsoft.com/en-us/aspnet/core" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">ASP.NET Core</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://learn.microsoft.com/en-us/ef/core" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Entity Framework Core</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">SignalR</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://www.postgresql.org/docs" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">PostgreSQL</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-4">Alati</h2>
          <div className="space-y-3">
            <a href="https://visualstudio.microsoft.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Visual Studio 2022</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://code.visualstudio.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">Visual Studio Code</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="flex justify-between group py-1">
              <span className="text-sm text-neutral-700 group-hover:text-orange-500 transition-colors">GitHub</span>
              <span className="text-stone-300 group-hover:text-orange-400 text-xs">→</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Literature