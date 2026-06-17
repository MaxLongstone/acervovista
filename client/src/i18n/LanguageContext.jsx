import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import en from './en'
import es from './es'

const STRINGS = { en, es }
const STORAGE_KEY = 'acervovista_lang'
const SUPPORTED = ['en', 'es']

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED.includes(stored) ? stored : 'en'
  })

  const setLang = useCallback((next) => {
    if (!SUPPORTED.includes(next)) return
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }, [])

  // t(key) — look up a string; fall back to English if the key is missing in
  // the active language, then fall back to the key itself so nothing blows up.
  // Supports simple interpolation: t('assistant.remaining', { n: 3, cap: 50 })
  const t = useCallback(
    (key, vars) => {
      const dict = STRINGS[lang] ?? STRINGS.en
      let str = dict[key] ?? STRINGS.en[key] ?? key
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        })
      }
      return str
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
