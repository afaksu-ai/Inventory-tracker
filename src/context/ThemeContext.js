import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [color, setColor] = useState('#e91e8c')
  const [darkMode, setDarkMode] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const { data } = await supabase.from('user_settings').select('theme_color, dark_mode').eq('user_id', user.id).maybeSingle()
      if (data?.theme_color) setColor(data.theme_color)
      if (data?.dark_mode) setDarkMode(data.dark_mode)
      setLoaded(true)
    }
    load()
  }, [])

  const updateColor = async (newColor) => {
    setColor(newColor)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_settings').upsert({ user_id: user.id, theme_color: newColor })
  }

  const updateDarkMode = async (val) => {
    setDarkMode(val)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_settings').upsert({ user_id: user.id, dark_mode: val })
  }

  const bg = darkMode ? '#111827' : '#f9fafb'
  const cardBg = darkMode ? '#1f2937' : '#ffffff'
  const textPrimary = darkMode ? '#f3f4f6' : '#111827'
  const textSecondary = darkMode ? '#9ca3af' : '#6b7280'
  const border = darkMode ? '#374151' : '#e5e7eb'

  if (!loaded) return null

  return (
    <ThemeContext.Provider value={{ color, updateColor, darkMode, updateDarkMode, bg, cardBg, textPrimary, textSecondary, border }}>
      {children}
    </ThemeContext.Provider>
  )
}
