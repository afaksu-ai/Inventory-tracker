import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Dashboard() {
  const [items, setItems] = useState([])
  useEffect(() => {
    supabase.from('items').select('*').then(({ data }) => setItems(data || []))
  }, [])
  const listed = items.filter(i => i.status === 'listed')
  const sold = items.filter(i => i.status === 'sold')
  const totalProfit = sold.reduce((sum, i) => sum + ((i.sale_price || 0) - (i.purchase_price || 0)), 0)
  const inventoryValue = listed.reduce((sum, i) => sum + (i.purchase_price || 0), 0)
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Listed Items', value: listed.length },
          { label: 'Sold Items', value: sold.length },
          { label: 'Total Profit', value: `${totalProfit.toFixed(0)} kr` },
          { label: 'Inventory Value', value: `${inventoryValue.toFixed(0)} kr` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className="text-2xl font-bold text-indigo-600">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
