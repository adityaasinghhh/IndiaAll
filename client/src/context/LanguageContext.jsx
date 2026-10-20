import { createContext, useContext, useState, useEffect } from 'react'
import en from '../i18n/en.js'
import es from '../i18n/es.js'
import pt from '../i18n/pt.js'

const translations = { en, es, pt }

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('indiaall-lang')
    return saved && translations[saved] ? saved : 'en'
  })

  useEffect(() => {
    localStorage.setItem('indiaall-lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
