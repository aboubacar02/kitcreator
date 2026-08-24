import { SYSTEM_PROMPT, buildToolPrompt, validateOutput } from './src/prompts/index.js'

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

// T1: builders avec les params EXACTS envoyes par les 4 outils
const p1 = buildToolPrompt('hook', { topic: 'fitness', platform: 'TikTok', tone: 'Energetic' })
const p2 = buildToolPrompt('script', { topic: 'ecommerce', duration: '30', style: 'Storytelling' })
const p3 = buildToolPrompt('hashtag', { niche: 'crypto', platform: 'YouTube Shorts' })
const p4 = buildToolPrompt('title', { title: 'How I make money online' })
const p5 = buildToolPrompt('pack', { topic: 'fitness', platform: 'TikTok', audience: 'beginners' })

check('T1a buildToolPrompt retourne 5 prompts non vides', [p1, p2, p3, p4, p5].every((p) => typeof p === 'string' && p.length > 100))
check('T1b hook contient sujet + plateforme + ton', p1.includes('fitness') && p1.includes('TikTok') && p1.includes('Energetic'))
check('T1c script contient duree + style', p2.includes('30-second') && p2.includes('Storytelling'))
check('T1d hashtag contient niche + plateforme', p3.includes('crypto') && p3.includes('YouTube Shorts'))
check('T1e title contient le titre', p4.includes('How I make money online'))
check('T1f pack exige un JSON structuré complet + sujet + audience', p5.includes('"hooks"') && p5.includes('"script"') && p5.includes('"seo_title"') && p5.includes('"broll_ideas"') && p5.includes('"next_ideas"') && p5.includes('valid JSON') && p5.includes('fitness') && p5.includes('beginners'))

// T2: SYSTEM_PROMPT par langue
const fr = SYSTEM_PROMPT('fr')
const en = SYSTEM_PROMPT('en')
check('T2a system FR = French + regles FR specifiques', fr.includes('French') && fr.includes('SPECIFIC FRENCH RULES'))
check('T2b system EN sans section FR', en.includes('English') && !en.includes('SPECIFIC FRENCH RULES'))
check('T2c code inconnu -> fallback English', SYSTEM_PROMPT('xx').includes('English'))

// T3: validateur hook
const dirty = "Sure! Here are your hooks:\n1. **Curiosité:** Premier hook\n2. **Bold:** Deuxième\n3. **Pain:** Troisième\n4. Quatrième\n5. Cinquième\n6. Sixième en trop"
const cleaned = validateOutput('hook', dirty)
const lines = cleaned.split('\n').filter(Boolean)
check('T3a filler "Sure! Here are..." supprime', !cleaned.includes('Sure!') && !cleaned.includes('Here are'))
check('T3b liste bridée a exactement 5', lines.length === 5)
check('T3c numerotation conservee et reindexee', lines[0].startsWith('1.') && lines[4].startsWith('5.'))

const freeform = validateOutput('hook', 'Format libre du modele\nLigne A\nLigne B')
check('T3d format non numerote preserve tel quel', freeform.includes('Ligne A') && freeform.includes('Format libre'))

// T4: validateur script
const voici = validateOutput('script', 'Voici votre script:\n**[0-3s] HOOK**')
check('T4 filler "Voici..." supprime', voici.startsWith('**[0-3s]'))

// T5: consignes de langue strictes presentes
check('T5a instruction stricte FR presente', fr.includes('Respond exclusively in French'))
check('T5b instruction stricte EN presente', en.includes('Respond exclusively in English'))
check('T5c discipline anti-filler presente', fr.includes('OUTPUT DISCIPLINE') && en.includes('OUTPUT DISCIPLINE'))

console.log('\nRESULTAT: ' + pass + ' OK / ' + fail + ' FAIL')
process.exit(fail > 0 ? 1 : 0)
