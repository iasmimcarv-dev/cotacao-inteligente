import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ darkMode: false, setDarkMode: () => {} })

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('themeMode') === 'dark'
  )

  useEffect(() => {
    // Persist and apply global html/body attributes early
    localStorage.setItem('themeMode', darkMode ? 'dark' : 'light')
    const mode = darkMode ? 'dark' : null
    if (mode) {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.style.backgroundColor = '#0b1220'
      document.body.style.backgroundColor = '#0b1220'
      document.documentElement.style.color = '#e5e7eb'
      document.body.style.color = '#e5e7eb'
    } else {
      document.documentElement.removeAttribute('data-theme')
      document.documentElement.style.backgroundColor = '#ffffff'
      document.body.style.backgroundColor = '#ffffff'
      document.documentElement.style.color = '#0f172a'
      document.body.style.color = '#0f172a'
    }
  }, [darkMode])

  const value = useMemo(() => ({ darkMode, setDarkMode }), [darkMode])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
