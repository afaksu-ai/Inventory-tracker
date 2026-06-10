import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

const PERIODS = [
  { label: 'This week', days: 7 },
  { label: 'This month', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'This year', days: 365 },
  { label: 'All time', days: null },
]

export default function Dashboard() {
  const [items, setItems] = useState([])
  const [period, setPeriod] = useState(PERIODS[4])

  useEffect(() => {
    supabase.from('items').select('*').then(({ data }) => setItems(data || []))
  }, [])

  const inPeriod = (dateStr) => {
    if (!period.days) return true
    if (!dateStr) return false
    const date = new Date(dateStr)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - period.days)
    return date >= cutoff
  }

  const listed = items.filter(i => i.status === 'listed')
  const sold = items.filter(i => i.status === 'sold' && inPeriod(i.date_sold))
  // inventoryValue removed
  const totalRevenue = sold.reduce((sum, i) => sum + (i.sale_price || 0), 0)
  const totalCost = sold.reduce((sum, i) => sum + (i.purchase_price || 0), 0)
  const totalProfit = totalRevenue - totalCost

  // VAT calculations (25% Swedish VAT)
  // If prices include VAT: VAT = price * 0.25/1.25 = price / 5
  const vatOnRevenue = totalRevenue / 5
  const revenueExVat = totalRevenue - vatOnRevenue
  const profitExVat = revenueExVat - totalCost
  const vatOwed = vatOnRevenue

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#e91e8c' }}>Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${period.label === p.label ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={period.label === p.label ? { backgroundColor: '#e91e8c' } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Listed Items', value: listed.length },
          { label: 'Items Sold', value: sold.length },
          { label: 'Total Revenue', value: `${totalRevenue.toFixed(0)} kr` },
          { label: 'Total Profit', value: `${totalProfit.toFixed(0)} kr` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className="text-2xl font-bold" style={{ color: '#e91e8c' }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* VAT dashboard */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#e91e8c' }}>🧾 VAT Summary (25% moms)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Revenue incl. VAT', value: `${totalRevenue.toFixed(0)} kr`, desc: 'What customers paid' },
            { label: 'VAT to pay (25%)', value: `${vatOwed.toFixed(0)} kr`, desc: 'Owed to Skatteverket' },
            { label: 'Revenue excl. VAT', value: `${revenueExVat.toFixed(0)} kr`, desc: 'Your actual revenue' },
            { label: 'Profit excl. VAT', value: `${profitExVat.toFixed(0)} kr`, desc: 'After costs and VAT' },
          ].map(card => (
            <div key={card.label} className="bg-pink-50 rounded-xl p-4">
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-xl font-bold" style={{ color: '#e91e8c' }}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">⚠️ VAT only applies if you're registered for moms. If you're under the threshold (80,000 kr/year), you may not need to charge VAT. Consult Skatteverket or an accountant.</p>
      </div>
    </div>
  )
}
