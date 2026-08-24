function stripLeadingFiller(text) {
  return text
    .replace(/^\s*(?:here(?:'s| is)[^:\n]*|voici[^:\n]*)[:!]?\s*/i, '')
    .replace(/^\s*(?:sure|of course|certainly|bien sûr)[,.!]*\s*/i, '')
    .trim()
}

function validateHook(text) {
  const numbered = text
    .split('\n')
    .filter((line) => /^\s*\d+\s*[.)]/.test(line))
  if (numbered.length >= 3) {
    return numbered.slice(0, 5).join('\n').trim()
  }
  return text
}

export function validateOutput(toolId, output) {
  let text = String(output || '').trim()
  if (!text) return text

  text = stripLeadingFiller(text)

  if (toolId === 'hook') {
    text = validateHook(text)
  }

  return text
}

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

function parseJsonLoose(raw) {
  const text = String(raw || '')
    .replace(/```json/gi, '```')
    .split('```')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
  const candidates = [String(raw || ''), ...text]
  for (const candidate of candidates) {
    const start = candidate.indexOf('{')
    const end = candidate.lastIndexOf('}')
    if (start === -1 || end <= start) continue
    try {
      const parsed = JSON.parse(candidate.slice(start, end + 1))
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      // try next candidate
    }
  }
  throw new Error('pack output is not valid JSON')
}

export function parseStructuredPack(raw) {
  const data = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : parseJsonLoose(raw)

  const hooks = Array.isArray(data.hooks)
    ? data.hooks
        .map((hook) => ({
          text: asTrimmedString(hook?.text),
          visual: asTrimmedString(hook?.visual),
        }))
        .filter((hook) => hook.text)
        .slice(0, 6)
    : []
  if (hooks.length < 3) throw new Error('pack hooks missing')

  const script = data.script ?? {}
  const intro = asTrimmedString(script.intro)
  const body = asTrimmedString(script.body)
  const cta = asTrimmedString(script.cta)
  if (!intro || !body) throw new Error('pack script missing')

  const broll = Array.isArray(script.broll_ideas)
    ? script.broll_ideas.map(asTrimmedString).filter(Boolean).slice(0, 6)
    : []

  const seoTitle = asTrimmedString(data.seo_title ?? data.title)
  if (!seoTitle) throw new Error('pack title missing')

  const hashtags = Array.isArray(data.hashtags)
    ? data.hashtags.map(asTrimmedString).filter(Boolean).slice(0, 15)
    : []
  if (!hashtags.length) throw new Error('pack hashtags missing')

  const nextIdeas = Array.isArray(data.next_ideas)
    ? data.next_ideas.map(asTrimmedString).filter(Boolean).slice(0, 5)
    : []

  return { hooks, script: { intro, body, broll_ideas: broll, cta }, seo_title: seoTitle, hashtags, next_ideas: nextIdeas }
}
