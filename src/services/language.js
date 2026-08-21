const STORAGE_KEY = 'kitcreator-language'

export const LANGUAGES = [
  { value: 'auto', label: 'Auto (browser)' },
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
]

function detectBrowserLanguage() {
  const candidates =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || 'en']
  for (const tag of candidates) {
    if ((tag || '').toLowerCase().startsWith('fr')) return 'fr'
  }
  return 'en'
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
  document.documentElement.lang = resolveLanguage()
}

applyDocumentLang()
