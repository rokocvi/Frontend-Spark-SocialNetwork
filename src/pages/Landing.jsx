import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Navbar */}
      <nav className="px-8 py-5 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold text-orange-500">Spark ⚡</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-lg border border-gray-700 hover:border-orange-500 text-gray-300 hover:text-white transition"
          >
            Prijava
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
          >
            Registracija
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="text-7xl mb-6">⚡</div>
        <h2 className="text-5xl font-bold mb-4">
          Spoji se s nekim <br />
          <span className="text-orange-500">tko te razumije</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-lg mb-10">
          Svaki dan objavi što te zanima. Spark te spoji s nekim tko dijeli isti interes — razgovarajte 24 sata.
        </p>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold rounded-xl transition"
        >
          Kreni ⚡
        </button>
      </div>

   
      <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto px-8 pb-16">
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="text-3xl mb-3">📝</div>
          <h3 className="text-lg font-semibold mb-2">Objavi Spark</h3>
          <p className="text-gray-400 text-sm">Svaki dan napiši što te zanima ili što tražiš.</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="text-3xl mb-3">🔥</div>
          <h3 className="text-lg font-semibold mb-2">Pronađi match</h3>
          <p className="text-gray-400 text-sm">Algoritam te spoji s nekim tko dijeli isti interes.</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="text-lg font-semibold mb-2">Razgovaraj</h3>
          <p className="text-gray-400 text-sm">Imaš 24 sata — sačuvaj vezu ili pusti da nestane.</p>
        </div>
      </div>
    </div>
  )
}

export default Landing