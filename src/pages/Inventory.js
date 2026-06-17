import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Inventory() {
  const [items, setItems] = useState([])

  useEffect(() => {
    supabase.from('items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [])

  const markSold = async (id, salePrice) => {
    const price = prompt('Sale price (kr)?')
    if (!price) return
    await supabase.from('items').update({
      status: 'sold', sale_price: parseFloat(price), date_sold: new Date().toISOString()
    }).eq('id', id)
    setItems(items.map(i => i.id === id ? { ...i, status: 'sold', sale_price: parseFloat(price) } : i))
  }

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return
    await supabase.from('items').delete().eq('id', id)
    setItems(items.filter(i => i.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              {['Item', 'Brand', 'Size', 'Bought', 'Listed', 'Platform', 'Status', 'Profit', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const profit = item.status === 'sold' ? (item.sale_price - item.purchase_price) : null
              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.brand}</td>
                  <td className="px-4 py-3">{item.size}</td>
                  <td className="px-4 py-3">{item.purchase_price} kr</td>
                  <td className="px-4 py-3">{item.listing_price} kr</td>
                  <td className="px-4 py-3">{item.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'sold' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {profit !== null ? <span className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>{profit > 0 ? '+' : ''}{profit} kr</span> : '—'}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {item.status === 'listed' && (
                      <button onClick={() => markSold(item.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                        Mark sold
                      </button>
                    )}
                    <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && <p className="text-center text-gray-400 py-10">No items yet. Add your first item!</p>}
      </div>
    </div>
  )
}
