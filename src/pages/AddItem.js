import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function AddItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', brand: '', size: '', purchase_price: '', listing_price: '',
    platform: 'Plick', notes: '', date_purchased: ''
  })
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  const handleSubmit = async () => {
    if (!form.name) return alert('Item name is required')
    const { data: { user } } = await supabase.auth.getUser()
    const data = {
      user_id: user.id,
      name: form.name,
      brand: form.brand || null,
      size: form.size || null,
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      listing_price: form.listing_price ? parseFloat(form.listing_price) : null,
      platform: form.platform || null,
      notes: form.notes || null,
      date_purchased: form.date_purchased || null,
      status: 'listed'
    }
    await supabase.from('items').insert([data])
    navigate('/inventory')
  }
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#e91e8c' }}>Add New Item</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item name *</label>
          <input name="name" placeholder="e.g. Levi's 501 W30 L32" value={form.name} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input name="brand" placeholder="e.g. Levi's" value={form.brand} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <input name="size" placeholder="e.g. W30 L32" value={form.size} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase price (kr)</label>
          <input name="purchase_price" type="number" placeholder="0" value={form.purchase_price} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Listing price (kr)</label>
          <input name="listing_price" type="number" placeholder="0" value={form.listing_price} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select name="platform" value={form.platform} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400">
            {['Plick','Vinted','Depop','eBay','Instagram','Other'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date purchased (optional)</label>
          <input name="date_purchased" type="date" value={form.date_purchased} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input name="notes" placeholder="Any extra details..." value={form.notes} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
        </div>
        <button onClick={handleSubmit}
          className="text-white rounded-lg py-2 font-medium transition"
          style={{ backgroundColor: '#e91e8c' }}>
          Save Item
        </button>
      </div>
    </div>
  )
}
