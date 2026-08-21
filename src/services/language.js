const STORAGE_KEY = 'kitcreator-language'

export const LANGUAGES = [
  { value: 'auto', label: 'Auto' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

function detectBrowserLanguage() {
  const candidates =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || '']
  for (const tag of candidates) {
    const lower = (tag || '').toLowerCase()
    if (lower.startsWith('fr')) return 'fr'
    if (lower.startsWith('es')) return 'es'
    if (lower.startsWith('en')) return 'en'
  }
  return 'fr'
}

export function getLanguagePreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'auto'
  } catch {
    return 'auto'
  }
}

export function setLanguagePreference(preference) {
  try {
    localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    /* storage unavailable */
  }
  applyDocumentLang()
}

export function resolveLanguage() {
  const preference = getLanguagePreference()
  return preference === 'auto' ? detectBrowserLanguage() : preference
}

export function languageInstruction(language = resolveLanguage()) {
  return language === 'fr'
    ? 'You are an expert assistant for content creators. Respond strictly in French. All generated content must be written exclusively in French.'
    : 'You are an expert assistant for content creators. Respond strictly in English. All generated content must be written exclusively in English.'
}

export function applyDocumentLang() {
  if (typeof document === 'undefined') return
  document.documentElement.lang = resolveLanguage()
}

applyDocumentLang()
