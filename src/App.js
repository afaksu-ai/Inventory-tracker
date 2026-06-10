import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import AddItem from './pages/AddItem'
import Login from './pages/Login'

function App() {
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ color: '#e91e8c' }}>Loading...</div>
  if (!user) return <Login />

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow px-6 py-4 flex gap-6 items-center">
          <Link to="/" className="font-bold" style={{ color: '#e91e8c' }}>📦 ResellTracker</Link>
          <Link to="/inventory" className="text-gray-600 hover:text-pink-600">Inventory</Link>
          <Link to="/add" className="text-gray-600 hover:text-pink-600">+ Add Item</Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-400">{user.email}</span>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-pink-600">Sign out</button>
          </div>
        </nav>
        <div className="p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/add" element={<AddItem />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}
export default App
