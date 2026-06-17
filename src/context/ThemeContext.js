import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../supabase'

const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }) {
  const [color, setColor] = useState('#e91e8c')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }
      const { data } = await supabase.from('user_settings').select('theme_color').eq('user_id', user.id).maybeSingle()
      if (data?.theme_color) setColor(data.theme_color)
      setLoaded(true)
    }
    load()
  }, [])

  const updateColor = async (newColor) => {
    setColor(newColor)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('user_settings').upsert({ user_id: user.id, theme_color: newColor })
  }

  if (!loaded) return null

  return (
    <ThemeContext.Provider value={{ color, updateColor }}>
      {children}
    </ThemeContext.Provider>
  )
}
