import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../context/LanguageContext'

export default function Settings() {
  const { t } = useLanguage()
  const [vatRate, setVatRate] = useState(25)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle()
      if (data) setVatRate(data.vat_rate)
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_settings').upsert({ user_id: user.id, vat_rate: parseFloat(vatRate) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return null

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#e91e8c' }}>⚙️ {t.settings}</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t.vatRate}</label>
        <p className="text-xs text-gray-400 mb-3">{t.vatRateDesc}</p>
        <div className="flex items-center gap-3">
          <input type="number" value={vatRate} onChange={e => setVatRate(e.target.value)}
            className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400" />
          <span className="text-gray-500">%</span>
          <button onClick={handleSave}
            className="text-sm text-white px-4 py-2 rounded-lg font-medium ml-auto"
            style={{ backgroundColor: '#e91e8c' }}>
            {t.save}
          </button>
        </div>
        {saved && <p className="text-sm text-green-600 mt-3">✓ {t.saved}</p>}
      </div>
    </div>
  )
}
