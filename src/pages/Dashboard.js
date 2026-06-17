import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../context/LanguageContext'

export default function Dashboard() {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [period, setPeriod] = useState(null)
  const [vatRate, setVatRate] = useState(25)

  const PERIODS = [
    { label: t.thisWeek, days: 7 },
    { label: t.thisMonth, days: 30 },
    { label: t.last3Months, days: 90 },
    { label: t.thisYear, days: 365 },
    { label: t.allTime, days: null },
  ]

  useEffect(() => {
    setPeriod(PERIODS[4])
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: settings } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
      if (settings) setVatRate(settings.vat_rate)
      const { data } = await supabase.from('items').select('*')
      setItems(data || [])
    }
    load()
  }, [])

  if (!period) return null

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
  const totalRevenue = sold.reduce((sum, i) => sum + (i.sale_price || 0), 0)
  const totalCost = sold.reduce((sum, i) => sum + (i.purchase_price || 0), 0)
  const totalProfit = totalRevenue - totalCost

  // VAT calc using custom rate (prices assumed to include VAT)
  const rate = parseFloat(vatRate) || 0
  const vatDivisor = 1 + (rate / 100)
  const revenueExVat = totalRevenue / vatDivisor
  const vatOnRevenue = totalRevenue - revenueExVat
  const profitExVat = revenueExVat - totalCost

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ color: '#e91e8c' }}>{t.dashboard}</h1>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button key={p.label} onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${period.label === p.label ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={period.label === p.label ? { backgroundColor: '#e91e8c' } : {}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: t.listedItems, value: listed.length },
          { label: t.soldItems, value: sold.length },
          { label: t.totalRevenue, value: `${totalRevenue.toFixed(0)} kr` },
          { label: t.totalProfit, value: `${totalProfit.toFixed(0)} kr` },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">{card.label}</p>
            <p className="text-2xl font-bold" style={{ color: '#e91e8c' }}>{card.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: '#e91e8c' }}>
          🧾 {t.vatSummary.replace('25%', `${rate}%`)}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.revenueInclVat, value: `${totalRevenue.toFixed(0)} kr`, desc: t.whatCustomersPaid },
            { label: t.vatToPay.replace('25%', `${rate}%`), value: `${vatOnRevenue.toFixed(0)} kr`, desc: t.owedToTax },
            { label: t.revenueExclVat, value: `${revenueExVat.toFixed(0)} kr`, desc: t.actualRevenue },
            { label: t.profitExclVat, value: `${profitExVat.toFixed(0)} kr`, desc: t.afterCosts },
          ].map(card => (
            <div key={card.label} className="bg-pink-50 rounded-xl p-4">
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-xl font-bold" style={{ color: '#e91e8c' }}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">{t.vatNote}</p>
      </div>
    </div>
  )
}
