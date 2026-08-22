import { resolveLanguage } from '../services/language.js'

const STRINGS = {
  en: {
    'nav.credits': '{n} credits',
    'nav.freeCredits': '{n}/{total} free daily credits',
    'nav.upgrade': 'Upgrade to PRO ($9.99)',
    'nav.logout': 'Log out',
    'nav.menu': 'Open menu',
    'drawer.navigate': 'Navigate',

    'tools.hook': 'Hook Generator',
    'tools.script': 'Short Script Writer',
    'tools.hashtag': 'Smart Hashtag Finder',
    'tools.title': 'Title Analyzer',
    'tools.hook.desc':
      'Scroll-stopping hooks optimized for US & EU TikTok, Instagram Reels and YouTube Shorts.',
    'tools.script.desc':
      'Ready-to-shoot scripts with timecodes: hook, body, climax and call-to-action.',
    'tools.hashtag.desc':
      'A balanced mix of broad, medium and niche hashtags to maximize your reach.',
    'tools.title.desc':
      'Score your titles and get more clickable variants in one click.',

    'sidebar.settings': 'Settings',
    'sidebar.myAccount': 'My account',

    'form.topic.label': 'Niche, topic, or keyword',
    'form.topic.placeholder.hook': 'e.g. Fitness tips, E-commerce, AI tools...',
    'form.topic.placeholder.script': 'e.g. How I grew my shop to $10k/month...',
    'form.platform': 'Platform',
    'form.tone': 'Tone',
    'form.duration': 'Duration (seconds)',
    'form.style': 'Style',
    'form.niche.label': 'Niche or keyword',
    'form.niche.placeholder':
      'e.g. Home workouts, Dropshipping, Personal finance...',
    'form.yourTitle.label': 'Your video title',
    'form.yourTitle.placeholder': 'Paste the title you want to analyze...',

    'tone.Energetic': 'Energetic',
    'tone.Curious': 'Curious',
    'tone.Bold': 'Bold',
    'tone.Inspirational': 'Inspirational',
    'tone.Funny': 'Funny',
    'style.Educational': 'Educational',
    'style.Storytelling': 'Storytelling',
    'style.Funny': 'Funny',
    'style.Persuasive': 'Persuasive',

    'btn.generateHooks': 'Generate Hooks',
    'btn.generateScript': 'Generate Script',
    'btn.findHashtags': 'Find Hashtags',
    'btn.analyzeTitle': 'Analyze Title',
    'common.generating': 'Generating...',
    'common.loadingText': 'The AI is writing your content...',

    'result.title': 'Generated results',
    'result.copy': 'Copy',
    'result.copied': 'Copied!',

    'errors.generic':
      'Unable to generate content. Please try again in a few moments.',
    'errors.credits': 'Not enough credits left today. Upgrade to PRO or come back tomorrow.',
    'errors.rate': 'Too many requests. Please wait a few seconds before trying again.',

    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your account and subscription.',
    'settings.section.account': 'Account',
    'settings.section.preferences': 'Preferences',
    'settings.section.subscription': 'Subscription',
    'settings.section.danger': 'Danger zone',
    'settings.activeSession': 'Active session',
    'settings.credits': 'Credits',
    'settings.freePlan': 'Free plan — resets daily',
    'settings.plan': 'Plan',
    'settings.free': 'Free',
    'settings.upgrade': 'Upgrade to PRO',
    'settings.upgradeHint': 'Unlock unlimited generations anytime.',
    'settings.language': 'AI output language',
    'settings.languageHint':
      'All AI-generated content (hooks, scripts, hashtags, titles) and this interface will use this language.',
    'settings.logout': 'Log out',
    'settings.logoutHint': 'End your session on this device.',

    'landing.heroTitle1': 'Create viral content',
    'landing.heroTitle2': 'in seconds',
    'landing.subtitle':
      'Hooks, scripts, hashtags, titles: the complete AI toolkit for TikTok, Reels and YouTube Shorts creators. Less time writing, more time creating.',
    'landing.ctaStart': 'Start for free',
    'landing.ctaTry': 'Try it for free',
    'landing.ctaExplore': 'Explore the tools',
    'landing.note': 'No credit card required · 5 free daily credits included',
    'landing.toolsTitle': '4 tools, one goal: performance',
    'landing.whyTitle': 'Why KitCreator?',
    'landing.creditPerRun': '{n} credit{n_s} per run',
    'landing.f1.t': 'Hooks that stop the scroll',
    'landing.f1.d': 'Generate hooks proven on millions of views, tailored to your platform and tone.',
    'landing.f2.t': 'Ready-to-shoot scripts',
    'landing.f2.d': 'Complete structures with timecodes: hook, body, climax and call-to-action.',
    'landing.f3.t': 'Smart hashtags',
    'landing.f3.d': 'A balanced mix of broad, medium and niche hashtags to maximize your reach.',
    'landing.f4.t': 'Optimized titles',
    'landing.f4.d': 'Analyze your titles, get a click-potential score and stronger variants.',
    'landing.finalTitle': 'Ready to level up?',
    'landing.finalText': 'Join creators who publish more without spending hours on their copy.',
    'landing.finalCta': 'Create my free account',
    'landing.rights': '© {year} KitCreator — All rights reserved.',

    'social.proof': 'creators already generate faster with KitCreator',

    'demo.notice':
      'Demo mode: Supabase is not configured yet. Credits reset daily and data is not persisted.',
    'setup.profileMissing':
      'Profile not found: run supabase/schema.sql in the Supabase SQL Editor (table profiles + policies), then reload this page.',
  },

  fr: {
    'nav.credits': '{n} crédits',
    'nav.freeCredits': '{n}/{total} crédits gratuits/jour',
    'nav.upgrade': 'Passer à PRO ($9.99)',
    'nav.logout': 'Déconnexion',
    'nav.menu': 'Ouvrir le menu',
    'drawer.navigate': 'Navigation',

    'tools.hook': 'Générateur d’accroches',
    'tools.script': 'Rédacteur de scripts',
    'tools.hashtag': 'Recherche de hashtags',
    'tools.title': 'Analyseur de titres',
    'tools.hook.desc':
      'Des accroches qui stoppent le scroll, optimisées pour TikTok, Instagram Reels et YouTube Shorts.',
    'tools.script.desc':
      'Des scripts prêts à tourner avec timecodes : hook, corps, climax et appel à l’action.',
    'tools.hashtag.desc':
      'Un mix équilibré de hashtags larges, moyens et de niche pour maximiser ta portée.',
    'tools.title.desc':
      'Note tes titres et obtiens des variantes plus cliquables en un clic.',

    'sidebar.settings': 'Paramètres',
    'sidebar.myAccount': 'Mon compte',

    'form.topic.label': 'Niche, sujet ou mot-clé',
    'form.topic.placeholder.hook': 'ex. Astuces fitness, E-commerce, Outils IA...',
    'form.topic.placeholder.script': 'ex. Comment j’ai fait passer ma boutique à 10k€/mois...',
    'form.platform': 'Plateforme',
    'form.tone': 'Ton',
    'form.duration': 'Durée (secondes)',
    'form.style': 'Style',
    'form.niche.label': 'Niche ou mot-clé',
    'form.niche.placeholder': 'ex. Sport à la maison, Dropshipping, Finance perso...',
    'form.yourTitle.label': 'Titre de ta vidéo',
    'form.yourTitle.placeholder': 'Colle ici le titre à analyser...',

    'tone.Energetic': 'Énergique',
    'tone.Curious': 'Curieux',
    'tone.Bold': 'Audacieux',
    'tone.Inspirational': 'Inspirant',
    'tone.Funny': 'Drôle',
    'style.Educational': 'Éducatif',
    'style.Storytelling': 'Storytelling',
    'style.Funny': 'Drôle',
    'style.Persuasive': 'Persuasif',

    'btn.generateHooks': 'Générer les accroches',
    'btn.generateScript': 'Générer le script',
    'btn.findHashtags': 'Trouver les hashtags',
    'btn.analyzeTitle': 'Analyser le titre',
    'common.generating': 'Génération...',
    'common.loadingText': 'L’IA génère ton contenu...',

    'result.title': 'Résultats générés',
    'result.copy': 'Copier',
    'result.copied': 'Copié !',

    'errors.generic':
      'Impossible de générer le contenu. Réessaie dans quelques instants.',
    'errors.credits': 'Plus assez de crédits aujourd’hui. Passe PRO ou reviens demain.',
    'errors.rate': 'Trop de requêtes. Patientez quelques secondes avant de réessayer.',

    'settings.title': 'Paramètres',
    'settings.subtitle': 'Gère ton compte et ton abonnement.',
    'settings.section.account': 'Compte',
    'settings.section.preferences': 'Préférences',
    'settings.section.subscription': 'Abonnement',
    'settings.section.danger': 'Zone de danger',
    'settings.activeSession': 'Session active',
    'settings.credits': 'Crédits',
    'settings.freePlan': 'Plan gratuit — réinitialisé chaque jour',
    'settings.plan': 'Abonnement',
    'settings.free': 'Gratuit',
    'settings.upgrade': 'Passer à PRO',
    'settings.upgradeHint': 'Débloque des générations illimitées à tout moment.',
    'settings.language': 'Langue des contenus IA',
    'settings.languageHint':
      'Tout le contenu généré par l’IA (accroches, scripts, hashtags, titres) et cette interface utiliseront cette langue.',
    'settings.logout': 'Déconnexion',
    'settings.logoutHint': 'Termine ta session sur cet appareil.',

    'landing.heroTitle1': 'Crée du contenu viral',
    'landing.heroTitle2': 'en quelques secondes',
    'landing.subtitle':
      'Accroches, scripts, hashtags, titres : la boîte à outils IA complète des créateurs TikTok, Reels et YouTube Shorts. Moins de temps à écrire, plus de temps à créer.',
    'landing.ctaStart': 'Commencer gratuitement',
    'landing.ctaTry': 'Essayer gratuitement',
    'landing.ctaExplore': 'Découvrir les outils',
    'landing.note': 'Sans carte bancaire · 5 crédits gratuits offerts chaque jour',
    'landing.toolsTitle': '4 outils, un seul objectif : la performance',
    'landing.whyTitle': 'Pourquoi KitCreator ?',
    'landing.creditPerRun': '{n} crédit{n_s} par génération',
    'landing.f1.t': 'Des accroches qui stoppent le scroll',
    'landing.f1.d': 'Génère des accroches éprouvées sur des millions de vues, adaptées à ta plateforme et ton ton.',
    'landing.f2.t': 'Des scripts prêts à tourner',
    'landing.f2.d': 'Des structures complètes avec timecodes : hook, corps, climax et appel à l’action.',
    'landing.f3.t': 'Des hashtags intelligents',
    'landing.f3.d': 'Un mix équilibré de hashtags larges, moyens et de niche pour maximiser ta portée.',
    'landing.f4.t': 'Des titres optimisés',
    'landing.f4.d': 'Analyse tes titres, obtiens un score de potentiel de clic et des variantes plus fortes.',
    'landing.finalTitle': 'Prêt à passer au niveau supérieur ?',
    'landing.finalText': 'Rejoins les créateurs qui publient plus sans passer des heures sur leurs textes.',
    'landing.finalCta': 'Créer mon compte gratuit',
    'landing.rights': '© {year} KitCreator — Tous droits réservés.',

    'social.proof': 'créateurs génèrent déjà plus vite avec KitCreator',

    'demo.notice':
      'Mode démo : Supabase n’est pas encore configuré. Les crédits se réinitialisent chaque jour et les données ne sont pas conservées.',
    'setup.profileMissing':
      'Profil introuvable : exécute supabase/schema.sql dans le SQL Editor de Supabase (table profiles + policies), puis recharge cette page.',
  },

  es: {
    'nav.credits': '{n} créditos',
    'nav.freeCredits': '{n}/{total} créditos gratis/día',
    'nav.upgrade': 'Pasar a PRO ($9.99)',
    'nav.logout': 'Cerrar sesión',
    'nav.menu': 'Abrir menú',
    'drawer.navigate': 'Navegación',

    'tools.hook': 'Generador de ganchos',
    'tools.script': 'Redactor de guiones',
    'tools.hashtag': 'Búsqueda de hashtags',
    'tools.title': 'Analizador de títulos',
    'tools.hook.desc':
      'Ganchos que detienen el scroll, optimizados para TikTok, Instagram Reels y YouTube Shorts.',
    'tools.script.desc':
      'Guiones listos para grabar con marcas de tiempo: gancho, cuerpo, clímax y llamada a la acción.',
    'tools.hashtag.desc':
      'Una mezcla equilibrada de hashtags amplios, medios y de nicho para maximizar tu alcance.',
    'tools.title.desc':
      'Puntúa tus títulos y consigue variantes más clicables en un clic.',

    'sidebar.settings': 'Ajustes',
    'sidebar.myAccount': 'Mi cuenta',

    'form.topic.label': 'Nicho, tema o palabra clave',
    'form.topic.placeholder.hook': 'ej. Consejos de fitness, E-commerce, Herramientas IA...',
    'form.topic.placeholder.script': 'ej. Cómo llevé mi tienda a 10k€/mes...',
    'form.platform': 'Plataforma',
    'form.tone': 'Tono',
    'form.duration': 'Duración (segundos)',
    'form.style': 'Estilo',
    'form.niche.label': 'Nicho o palabra clave',
    'form.niche.placeholder': 'ej. Ejercicio en casa, Dropshipping, Finanzas personales...',
    'form.yourTitle.label': 'Título de tu vídeo',
    'form.yourTitle.placeholder': 'Pega aquí el título a analizar...',

    'tone.Energetic': 'Enérgico',
    'tone.Curious': 'Curioso',
    'tone.Bold': 'Atrevido',
    'tone.Inspirational': 'Inspirador',
    'tone.Funny': 'Divertido',
    'style.Educational': 'Educativo',
    'style.Storytelling': 'Narrativo',
    'style.Funny': 'Divertido',
    'style.Persuasive': 'Persuasivo',

    'btn.generateHooks': 'Generar ganchos',
    'btn.generateScript': 'Generar guion',
    'btn.findHashtags': 'Buscar hashtags',
    'btn.analyzeTitle': 'Analizar título',
    'common.generating': 'Generando...',
    'common.loadingText': 'La IA está creando tu contenido...',

    'result.title': 'Resultados generados',
    'result.copy': 'Copiar',
    'result.copied': '¡Copiado!',

    'errors.generic':
      'No se pudo generar el contenido. Inténtalo de nuevo en unos momentos.',
    'errors.credits': 'No quedan créditos suficientes hoy. Pásate a PRO o vuelve mañana.',
    'errors.rate': 'Demasiadas solicitudes. Espera unos segundos antes de reintentar.',

    'settings.title': 'Ajustes',
    'settings.subtitle': 'Gestiona tu cuenta y tu suscripción.',
    'settings.section.account': 'Cuenta',
    'settings.section.preferences': 'Preferencias',
    'settings.section.subscription': 'Suscripción',
    'settings.section.danger': 'Zona de peligro',
    'settings.activeSession': 'Sesión activa',
    'settings.credits': 'Créditos',
    'settings.freePlan': 'Plan gratis — se reinicia cada día',
    'settings.plan': 'Suscripción',
    'settings.free': 'Gratis',
    'settings.upgrade': 'Pasar a PRO',
    'settings.upgradeHint': 'Desbloquea generaciones ilimitadas cuando quieras.',
    'settings.language': 'Idioma del contenido IA',
    'settings.languageHint':
      'Todo el contenido generado por la IA (ganchos, guiones, hashtags, títulos) y esta interfaz usarán este idioma.',
    'settings.logout': 'Cerrar sesión',
    'settings.logoutHint': 'Termina tu sesión en este dispositivo.',

    'landing.heroTitle1': 'Crea contenido viral',
    'landing.heroTitle2': 'en segundos',
    'landing.subtitle':
      'Ganchos, guiones, hashtags, títulos: el kit completo de IA para creadores de TikTok, Reels y YouTube Shorts. Menos tiempo escribiendo, más tiempo creando.',
    'landing.ctaStart': 'Empezar gratis',
    'landing.ctaTry': 'Probar gratis',
    'landing.ctaExplore': 'Descubrir las herramientas',
    'landing.note': 'Sin tarjeta bancaria · 5 créditos gratis cada día',
    'landing.toolsTitle': '4 herramientas, un objetivo: el rendimiento',
    'landing.whyTitle': '¿Por qué KitCreator?',
    'landing.creditPerRun': '{n} crédito{n_s} por generación',
    'landing.f1.t': 'Ganchos que detienen el scroll',
    'landing.f1.d': 'Genera ganchos probados en millones de vistas, adaptados a tu plataforma y tu tono.',
    'landing.f2.t': 'Guiones listos para grabar',
    'landing.f2.d': 'Estructuras completas con marcas de tiempo: gancho, cuerpo, clímax y llamada a la acción.',
    'landing.f3.t': 'Hashtags inteligentes',
    'landing.f3.d': 'Una mezcla equilibrada de hashtags amplios, medios y de nicho para maximizar tu alcance.',
    'landing.f4.t': 'Títulos optimizados',
    'landing.f4.d': 'Analiza tus títulos, consigue una puntuación de potencial de clic y variantes más fuertes.',
    'landing.finalTitle': '¿Listo para subir de nivel?',
    'landing.finalText': 'Únete a los creadores que publican más sin pasar horas escribiendo.',
    'landing.finalCta': 'Crear mi cuenta gratis',
    'landing.rights': '© {year} KitCreator — Todos los derechos reservados.',

    'social.proof': 'creadores ya generan más rápido con KitCreator',

    'demo.notice':
      'Modo demo: Supabase aún no está configurado. Los créditos se reinician cada día y los datos no se guardan.',
    'setup.profileMissing':
      'Perfil no encontrado: ejecuta supabase/schema.sql en el SQL Editor de Supabase (tabla profiles + políticas) y recarga esta página.',
  },
}

export function translate(lang, key, vars) {
  let str = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replaceAll(`{${name}}`, String(value))
    }
  }
  return str
}

export function t(key, vars) {
  return translate(resolveLanguage(), key, vars)
}

export function friendlyError(err, translateFn) {
  const message = err?.message ?? ''
  if (/credit/i.test(message)) {
    return translateFn('errors.credits')
  }
  if (/rate limit|too many/i.test(message)) {
    return translateFn('errors.rate')
  }
  console.error(err)
  return translateFn('errors.generic')
}
