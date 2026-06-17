import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const PRESET_COLORS = ['#e91e8c', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6', '#000000']

export default function Settings() {
  const { t } = useLanguage()
  const { color, updateColor, darkMode, updateDarkMode, cardBg, textPrimary, textSecondary, border } = useTheme()
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
    await supabase.from('user_settings').upsert({ user_id: user.id, vat_rate: parseFloat(vatRate), theme_color: color, dark_mode: darkMode })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return null

  return (
    <div className="max-w-md flex flex-col gap-6">
      <h1 className="text-2xl font-bold" style={{ color }}>⚙️ {t.settings}</h1>

      <div className="rounded-xl shadow p-6" style={{ backgroundColor: cardBg }}>
        <label className="block text-sm font-medium mb-3" style={{ color: textPrimary }}>
          {t.lang === 'sv' ? 'Mörkt läge' : 'Dark mode'}
        </label>
        <div className="flex gap-3">
          <button onClick={() => updateDarkMode(false)}
            className="flex-1 py-2 rounded-lg text-sm font-medium border-2 transition"
            style={{ borderColor: !darkMode ? color : border, color: !darkMode ? color : textSecondary }}>
            ☀️ {t.lang === 'sv' ? 'Ljust' : 'Light'}
          </button>
          <button onClick={() => updateDarkMode(true)}
            className="flex-1 py-2 rounded-lg text-sm font-medium border-2 transition"
            style={{ borderColor: darkMode ? color : border, color: darkMode ? color : textSecondary }}>
            🌙 {t.lang === 'sv' ? 'Mörkt' : 'Dark'}
          </button>
        </div>
      </div>

      <div className="rounded-xl shadow p-6" style={{ backgroundColor: cardBg }}>
        <label className="block text-sm font-medium mb-1" style={{ color: textPrimary }}>{t.vatRate}</label>
        <p className="text-xs mb-3" style={{ color: textSecondary }}>{t.vatRateDesc}</p>
        <div className="flex items-center gap-3">
          <input type="number" value={vatRate} onChange={e => setVatRate(e.target.value)}
            className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{ backgroundColor: cardBg, color: textPrimary, borderColor: border }} />
          <span style={{ color: textSecondary }}>%</span>
        </div>
      </div>

      <div className="rounded-xl shadow p-6" style={{ backgroundColor: cardBg }}>
        <label className="block text-sm font-medium mb-3" style={{ color: textPrimary }}>
          {t.lang === 'sv' ? 'Färgtema' : 'Theme color'}
        </label>
        <div className="flex gap-3 flex-wrap mb-4">
          {PRESET_COLORS.map(c => (
            <button key={c} onClick={() => updateColor(c)}
              className="w-10 h-10 rounded-full border-2 transition"
              style={{ backgroundColor: c, borderColor: color === c ? textPrimary : 'transparent' }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: textSecondary }}>
            {t.lang === 'sv' ? 'Eller välj egen färg:' : 'Or pick a custom color:'}
          </span>
          <input type="color" value={color} onChange={e => updateColor(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border-0" />
        </div>
      </div>

      <button onClick={handleSave}
        className="text-sm text-white px-4 py-2 rounded-lg font-medium"
        style={{ backgroundColor: color }}>
        {t.save}
      </button>
      {saved && <p className="text-sm text-green-600">✓ {t.saved}</p>}
    </div>
  )
}
