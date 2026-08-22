import {
  generate,
  getTool,
  validateParams,
  setMinGenerateInterval,
  INPUT_LIMITS,
} from './src/services/aiEngine.js'
import { friendlyError } from './src/i18n/strings.js'
import { translate } from './src/i18n/strings.js'

let pass = 0
let fail = 0
function check(label, ok) {
  if (ok) {
    pass++
    console.log('OK   ' + label)
  } else {
    fail++
    console.log('FAIL ' + label)
  }
}
async function rejects(fn, pattern) {
  try {
    await fn()
    return false
  } catch (err) {
    return pattern ? pattern.test(err.message) : true
  }
}

// T1: validation des entrees
check('T1a sujet non-string rejeté', await rejects(() => validateParams('hook', { topic: 42, tone: 'Bold' }), /Invalid topic/))
check('T1b sujet vide rejeté', await rejects(() => validateParams('hook', { topic: '   ' }), /Invalid topic/))
const long = 'x'.repeat(5000)
check('T1c sujet trop long tronqué à la limite', validateParams('hook', { topic: long }).topic.length === INPUT_LIMITS.topic)
check('T1d ton inconnu rejeté', await rejects(() => validateParams('hook', { topic: 'ok', tone: '<script>alert(1)</script>' }), /Invalid tone/))
check('T1e durée impossible rejetée', await rejects(() => validateParams('script', { topic: 'ok', duration: '999' }), /Invalid duration/))
check('T1f style inconnu rejeté', await rejects(() => validateParams('script', { topic: 'ok', style: 'DROP TABLE' }), /Invalid style/))
check('T1g outil inconnu rejeté par generate', await rejects(() => generate('hack', { topic: 'x' }), /Unknown tool/))
check('T1h params absents -> champ requis rejeté proprement', await rejects(() => validateParams('hashtag', null), /Invalid niche/))

// T2: generate en mode démo avec params sains
setMinGenerateInterval(0)
const mock = await generate('hook', { topic: 'fitness', platform: 'TikTok', tone: 'Bold' })
check('T2a génération démo retourne le contenu', mock.includes('fitness'))

// T3: anti-spam client
setMinGenerateInterval(10000)
check('T3a 2e appel immédiat bloqué (rate limit client)', await rejects(() => generate('title', { title: 'test' }), /Rate limit/i))
setMinGenerateInterval(0)

// T4: mapping erreurs utilisateur propres
const frCredit = friendlyError(new Error('Not enough credits. Please upgrade to PRO.'), (k) => translate('fr', k))
check('T4a erreur crédits traduite FR', frCredit === translate('fr', 'errors.credits'))
const frRate = friendlyError(new Error('Rate limit exceeded. Please wait.'), (k) => translate('fr', k))
check('T4b erreur rate limit traduite FR', frRate === translate('fr', 'errors.rate'))
const frGeneric = friendlyError(new Error('AI API error (500) stack trace DATABASE_URL=...'), (k) => translate('fr', k))
check('T4c erreur interne masquée derrière message générique', frGeneric === translate('fr', 'errors.generic') && !frGeneric.includes('DATABASE_URL'))

// T5: coût crédits cohérent
check('T5 coûts outils présents', [getTool('hook'), getTool('script'), getTool('hashtag'), getTool('title')].every((t) => t && t.credits >= 1))

console.log('\nRESULTAT SECURITE: ' + pass + ' OK / ' + fail + ' FAIL')
process.exit(fail > 0 ? 1 : 0)
