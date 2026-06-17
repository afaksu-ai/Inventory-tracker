import { useState } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function AddItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', brand: '', size: '', purchase_price: '', listing_price: '',
    platform: 'Plick', notes: '', date_purchased: ''
  })

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.name) return alert('Item name is required')
    await supabase.from('items').insert([{ ...form, status: 'listed' }])
    navigate('/inventory')
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} placeholder={placeholder}
        value={form[name]} onChange={handleChange}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
    </div>
  )

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <Field label="Item name *" name="name" placeholder="e.g. Levi's 501 W30 L32" />
        <Field label="Brand" name="brand" placeholder="e.g. Levi's" />
        <Field label="Size" name="size" placeholder="e.g. W30 L32" />
        <Field label="Purchase price (kr)" name="purchase_price" type="number" placeholder="0" />
        <Field label="Listing price (kr)" name="listing_price" type="number" placeholder="0" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
          <select name="platform" value={form.platform} onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            {['Plick', 'Vinted', 'Depop', 'eBay', 'Instagram', 'Other'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <Field label="Date purchased" name="date_purchased" type="date" />
        <Field label="Notes" name="notes" placeholder="Any extra details..." />
        <button onClick={handleSubmit}
          className="bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 transition">
          Save Item
        </button>
      </div>
    </div>
  )
}