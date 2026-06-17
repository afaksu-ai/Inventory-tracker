import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useLanguage } from './context/LanguageContext'
import { useTheme } from './context/ThemeContext'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import AddItem from './pages/AddItem'
import ImportItems from './pages/ImportItems'
import Settings from './pages/Settings'
import Login from './pages/Login'

function LanguagePicker() {
  const { setLang } = useLanguage()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#e91e8c' }}>📦 ResellTracker</h1>
        <p className="text-gray-500 text-sm mb-8">Choose your language / Välj språk</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => setLang('en')}
            className="flex flex-col items-center gap-2 border-2 rounded-xl p-4 hover:border-pink-400 transition w-32"
            style={{ borderColor: '#e5e7eb' }}>
            <span className="text-3xl">🇬🇧</span>
            <span className="font-medium text-gray-700">English</span>
          </button>
          <button onClick={() => setLang('sv')}
            className="flex flex-col items-center gap-2 border-2 rounded-xl p-4 hover:border-pink-400 transition w-32"
            style={{ borderColor: '#e5e7eb' }}>
            <span className="text-3xl">🇸🇪</span>
            <span className="font-medium text-gray-700">Svenska</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const { lang, t } = useLanguage()
  const { color } = useTheme()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!lang) return <LanguagePicker />
  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ color }}>{t.loading}</div>
  if (!user) return <Login />

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow px-6 py-4 flex gap-6 items-center flex-wrap">
          <Link to="/" className="font-bold" style={{ color }}>📦 {t.appName}</Link>
          <Link to="/inventory" className="text-gray-600 hover:opacity-70">{t.inventory}</Link>
          <Link to="/add" className="text-gray-600 hover:opacity-70">{t.addItem}</Link>
          <Link to="/import" className="text-gray-600 hover:opacity-70">
            {lang === 'sv' ? '📂 Importera' : '📂 Import'}
          </Link>
          <Link to="/settings" className="text-gray-600 hover:opacity-70">⚙️</Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="text-sm text-gray-500 hover:opacity-70">{t.logout}</button>
          </div>
        </nav>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/import" element={<ImportItems />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}
export default App
