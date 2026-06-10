import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import AddItem from './pages/AddItem'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow px-6 py-4 flex gap-6">
          <Link to="/" className="font-bold text-indigo-600">📦 ResellTracker</Link>
          <Link to="/inventory" className="text-gray-600 hover:text-indigo-600">Inventory</Link>
          <Link to="/add" className="text-gray-600 hover:text-indigo-600">+ Add Item</Link>
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
