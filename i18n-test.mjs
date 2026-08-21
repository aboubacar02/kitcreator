import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { translate } from './src/i18n/strings.js'

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, files)
    else if (/\.(jsx?|js)$/.test(name)) files.push(p)
  }
  return files
}

const sourceFiles = walk('./src').filter((f) => !f.includes('i18n'))
const keySet = new Set()

for (const file of sourceFiles) {
  const content = readFileSync(file, 'utf8')
  // clés statiques: t('xxx') ou translate(lang,'xxx')
  for (const m of content.matchAll(/\bt\(\s*'([^']+)'/g)) keySet.add(m[1])
  // clés dynamiques connues
}
// expansion des clés dynamiques
const TOOLS = ['hook', 'script', 'hashtag', 'title']
for (const id of TOOLS) {
  keySet.add(`tools.${id}`)
  keySet.add(`tools.${id}.desc`)
}
const TONES = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']
const STYLES = ['Educational', 'Storytelling', 'Funny', 'Persuasive']
for (const q of TONES) keySet.add(`tone.${q}`)
for (const q of STYLES) keySet.add(`style.${q}`)
for (const k of ['f1', 'f2', 'f3', 'f4']) {
  keySet.add(`landing.${k}.t`)
  keySet.add(`landing.${k}.d`)
}

let fail = 0
const sampleVars = { n: '1', total: '5', year: '2026', n_s: '' }
for (const lang of ['en', 'fr', 'es']) {
  for (const key of [...keySet].sort()) {
    const value = translate(lang, key, sampleVars)
    const missing = value === key || /undefined/.test(value)
    if (missing) {
      fail++
      console.log(`MISSING [${lang}] ${key}`)
    }
  }
}

// vérif variables bien substituées
const checks = [
  ['fr', 'nav.credits', { n: 5 }, '5'],
  ['fr', 'landing.rights', { year: 2026 }, '2026'],
  ['en', 'landing.creditPerRun', { n: 2, n_s: 's' }, '2 credits per run'],
]
for (const [lang, key, vars, expect] of checks) {
  const out = translate(lang, key, vars)
  if (!out.includes(expect)) {
    fail++
    console.log(`VAR FAIL [${lang}] ${key} -> "${out}"`)
  }
}

console.log(fail === 0 ? `OK: ${keySet.size} cles presentes dans les 3 langues` : `${fail} problemes`)
process.exit(fail > 0 ? 1 : 0)
