import { resolveLanguage } from '../services/language.js'

const STRINGS = {
  en: {
    'tools.hook': 'Hook Generator',
    'tools.script': 'Short Script Writer',
    'tools.hashtag': 'Smart Hashtag Finder',
    'tools.title': 'Title Analyzer',
    'nav.credits': '{n} credits',
    'nav.freeCredits': '{n}/{total} free daily credits',
    'nav.upgrade': 'Upgrade to PRO ($9.99)',
    'nav.logout': 'Log out',
    'sidebar.settings': 'Settings',
    'sidebar.myAccount': 'My account',
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and subscription.',
    'settings.activeSession': 'Active session',
    'settings.credits': 'Credits',
    'settings.freePlan': 'Free plan — resets daily',
    'settings.plan': 'Plan',
    'settings.free': 'Free',
    'settings.upgradeHint': 'Upgrade anytime from the navbar',
    'settings.language': 'AI Output Language',
    'settings.languageHint':
      'All AI-generated content (hooks, scripts, hashtags, titles) will be written in this language.',
    'settings.logout': 'Log out',
  },
  fr: {
    'tools.hook': 'Générateur d’accroches',
    'tools.script': 'Rédacteur de scripts',
    'tools.hashtag': 'Recherche de hashtags',
    'tools.title': 'Analyseur de titres',
    'nav.credits': '{n} crédits',
    'nav.freeCredits': '{n}/{total} crédits gratuits/jour',
    'nav.upgrade': 'Passer à PRO ($9.99)',
    'nav.logout': 'Déconnexion',
    'sidebar.settings': 'Paramètres',
    'sidebar.myAccount': 'Mon compte',
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gère ton compte et ton abonnement.',
    'settings.activeSession': 'Session active',
    'settings.credits': 'Crédits',
    'settings.freePlan': 'Plan gratuit — réinitialisé chaque jour',
    'settings.plan': 'Abonnement',
    'settings.free': 'Gratuit',
    'settings.upgradeHint': 'Passe PRO à tout moment depuis la barre du haut',
    'settings.language': 'Langue des contenus IA',
    'settings.languageHint':
      'Tout le contenu généré par l’IA (accroches, scripts, hashtags, titres) sera rédigé dans cette langue.',
    'settings.logout': 'Déconnexion',
  },
}

export function t(key, vars) {
  const lang = resolveLanguage()
  let str = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replaceAll(`{${name}}`, String(value))
    }
  }
  return str
}
