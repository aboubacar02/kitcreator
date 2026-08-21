import { createContext, useContext, useMemo, useState } from 'react'
import {
  applyDocumentLang,
  resolveLanguage,
  setLanguagePreference,
} from '../services/language.js'
import { translate } from './strings.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => resolveLanguage())

  const value = useMemo(
    () => ({
      lang,
      t: (key, vars) => translate(lang, key, vars),
      setLanguage: (code) => {
        setLanguagePreference(code)
        setLang(resolveLanguage())
        applyDocumentLang()
      },
    }),
    [lang],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useI18n must be used within <LanguageProvider>')
  return ctx
}
