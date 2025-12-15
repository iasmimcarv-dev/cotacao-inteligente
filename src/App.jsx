import { NavLink, Route, Routes } from 'react-router-dom'
import QuotePage from './pages/QuotePage'
import AdminPage from './pages/AdminPage'
import { useTheme } from './theme/ThemeProvider'

function App() {
  const { darkMode } = useTheme()
  const mainBg = darkMode ? 'bg-slate-900' : 'bg-white'
  const headerGradient = 'bg-gradient-to-r from-blue-600 to-blue-700'
  const headerTextSub = 'text-blue-100'
  const navActive = darkMode
    ? 'bg-slate-100 text-blue-600 shadow-md-refined'
    : 'bg-white text-blue-600 shadow-md-refined'
  const navInactive =
    'bg-blue-500 text-white hover:bg-blue-600 transition-smooth'

  return (
    <div className={'min-h-screen'}>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header
          className={`mb-8 rounded-2xl header-gradient-premium p-8 shadow-lg-refined relative overflow-hidden`}
        >
          <div className="header-particles"></div>
          <div className="header-shine"></div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between relative z-10">
            <div className="flex-1">
              <p
                className={`text-sm font-semibold uppercase tracking-widest ${headerTextSub} animate-fade-in-down`}
              >
                Planos de Saúde
              </p>
              <h1 className="mt-3 text-4xl font-bold text-white leading-tight animate-fade-in-up animate-text-shimmer">
                Cotação Inteligente
              </h1>
              <p className={`mt-3 text-base leading-relaxed ${headerTextSub}`}>
                Simule preços, compare coparticipações e encontre a melhor rede
                credenciada.
              </p>
            </div>
            <nav className="flex gap-3 text-sm font-semibold self-start sm:self-auto sm:ml-auto">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? `px-5 py-2.5 rounded-full font-bold transition-smooth btn-shine hover:scale-105 active:scale-95 ${navActive}`
                    : `px-5 py-2.5 rounded-full btn-shine hover:scale-105 active:scale-95 ${navInactive}`
                }
                end
              >
                💰 Cotar
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? `px-5 py-2.5 rounded-full font-bold transition-smooth btn-shine hover:scale-105 active:scale-95 ${navActive}`
                    : `px-5 py-2.5 rounded-full btn-shine hover:scale-105 active:scale-95 ${navInactive}`
                }
              >
                ⚙️ Admin
              </NavLink>
            </nav>
          </div>
        </header>

        <main
          className={`rounded-2xl ${mainBg} p-8 shadow-lg-refined ${
            darkMode ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          <Routes>
            <Route path="/" element={<QuotePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
