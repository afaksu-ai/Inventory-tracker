import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    supabase.from('items').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []))
  }, [])

  const markSold = async (id) => {
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

  const exportCSV = () => {
    const headers = ['Name','Brand','Size','Purchase Price','Listing Price','Sale Price','Platform','Status','Profit','Date Purchased','Date Sold','Notes']
    const rows = items.map(i => [
      i.name, i.brand, i.size, i.purchase_price, i.listing_price, i.sale_price,
      i.platform, i.status,
      i.status === 'sold' ? (i.sale_price - i.purchase_price) : '',
      i.date_purchased, i.date_sold, i.notes
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reselltracker-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
  }

  const editItem = async (item) => {
    const name = prompt('Item name:', item.name)
    if (!name) return
    const brand = prompt('Brand:', item.brand || '')
    const size = prompt('Size:', item.size || '')
    const purchase_price = prompt('Purchase price:', item.purchase_price || '')
    const listing_price = prompt('Listing price:', item.listing_price || '')
    const notes = prompt('Notes:', item.notes || '')
    await supabase.from('items').update({
      name, brand: brand || null, size: size || null,
      purchase_price: purchase_price ? parseFloat(purchase_price) : null,
      listing_price: listing_price ? parseFloat(listing_price) : null,
      notes: notes || null
    }).eq('id', item.id)
    setItems(items.map(i => i.id === item.id ? {
      ...i, name, brand, size,
      purchase_price: parseFloat(purchase_price),
      listing_price: parseFloat(listing_price),
      notes
    } : i))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#e91e8c' }}>Inventory</h1>
        <button onClick={exportCSV}
          className="text-sm text-white px-4 py-2 rounded-lg font-medium"
          style={{ backgroundColor: '#e91e8c' }}>
          ⬇ Export CSV
        </button>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-2xl w-full px-4">
            <img src={selectedPhoto} alt="Full size" className="w-full rounded-xl object-contain max-h-screen" />
            <button onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-6 text-white text-3xl font-bold hover:text-pink-400">×</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              {['Photo','Item','Brand','Size','Bought','Listed','Platform','Status','Profit','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const profit = item.status === 'sold' ? (item.sale_price - item.purchase_price) : null
              return (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {item.photo_url
                      ? <img src={item.photo_url} alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                          onClick={() => setSelectedPhoto(item.photo_url)} />
                      : <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">No photo</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3">{item.brand}</td>
                  <td className="px-4 py-3">{item.size}</td>
                  <td className="px-4 py-3">{item.purchase_price} kr</td>
                  <td className="px-4 py-3">{item.listing_price} kr</td>
                  <td className="px-4 py-3">{item.platform}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'sold' ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-pink-700'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {profit !== null ? <span className={profit >= 0 ? 'text-green-600' : 'text-red-500'}>{profit > 0 ? '+' : ''}{profit} kr</span> : '—'}
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    {item.status === 'listed' && (
                      <button onClick={() => markSold(item.id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Mark sold</button>
                    )}
                    <button onClick={() => editItem(item)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Delete</button>
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
