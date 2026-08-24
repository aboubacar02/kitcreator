import { FunctionsHttpError } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase.js'
import { resolveLanguage } from './language.js'

// ------------------------------------------------------------
// AUCUNE clÃ© IA cÃ´tÃ© client.
// Les appels fournisseurs passent exclusivement par l'Edge Function
// `generate` (secrets serveur). Le frontend n'envoie que :
//   { tool, language, input }
// ------------------------------------------------------------

export const TOOLS = [
  {
    id: 'hook',
    name: 'Hook Generator',
    description: 'Scroll-stopping hooks that grab attention in 3 seconds.',
    credits: 1,
  },
  {
    id: 'script',
    name: 'Short Script Writer',
    description: 'Ready-to-shoot script structures for Reels & TikTok.',
    credits: 2,
  },
  {
    id: 'hashtag',
    name: 'Smart Hashtag Finder',
    description: 'A broad, medium and niche hashtag mix to maximize reach.',
    credits: 1,
  },
  {
    id: 'title',
    name: 'Title Analyzer',
    description: 'Score your titles and get more clickable variants.',
    credits: 1,
  },
  {
    id: 'pack',
    name: 'Content Pack',
    description:
      'One click: hooks, script, title, hashtags and next video ideas.',
    credits: 4,
  },
]

export function getTool(id) {
  return TOOLS.find((t) => t.id === id)
}

// ------------------------------------------------------------
// Validation stricte des entrÃ©es (dÃ©fense en profondeur ;
// l'Edge Function re-valide tout cÃ´tÃ© serveur)
// ------------------------------------------------------------
export const INPUT_LIMITS = {
  topic: 300,
  niche: 150,
  title: 300,
  platform: 40,
  audience: 160,
  objective: 160,
  keywords: 180,
}

const ALLOWED_DURATIONS = ['15', '30', '60']
const ALLOWED_TONES = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']
const ALLOWED_STYLES = ['Educational', 'Storytelling', 'Funny', 'Persuasive']

function requireText(value, name, maxLength) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${name}.`)
  }
  const cleaned = value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
  if (!cleaned) {
    throw new Error(`Invalid ${name}.`)
  }
  return cleaned
}

function requireOneOf(value, name, allowedValues) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!allowedValues.includes(raw)) {
    throw new Error(`Invalid ${name}.`)
  }
  return raw
}

function optionalText(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export function validateParams(toolId, params) {
  const input = params && typeof params === 'object' ? params : {}
  switch (toolId) {
    case 'hook':
      return {
        topic: requireText(input.topic, 'topic', INPUT_LIMITS.topic),
        platform: requireText(input.platform ?? 'TikTok', 'platform', INPUT_LIMITS.platform),
        tone: requireOneOf(input.tone ?? 'Energetic', 'tone', ALLOWED_TONES),
      }
    case 'script': {
      const durationRaw = String(input.duration ?? '30')
      if (!ALLOWED_DURATIONS.includes(durationRaw)) {
        throw new Error('Invalid duration.')
      }
      return {
        topic: requireText(input.topic, 'topic', INPUT_LIMITS.topic),
        duration: Number(durationRaw),
        style: requireOneOf(input.style ?? 'Educational', 'style', ALLOWED_STYLES),
        audience: optionalText(input.audience, INPUT_LIMITS.audience),
        objective: optionalText(input.objective, INPUT_LIMITS.objective),
      }
    }
    case 'hashtag':
      return {
        niche: requireText(input.niche, 'niche', INPUT_LIMITS.niche),
        platform: requireText(input.platform ?? 'TikTok', 'platform', INPUT_LIMITS.platform),
        keywords: optionalText(input.keywords, INPUT_LIMITS.keywords),
      }
    case 'title':
      return {
        title: requireText(input.title, 'title', INPUT_LIMITS.title),
      }
    case 'pack':
      return {
        topic: requireText(input.topic, 'topic', INPUT_LIMITS.topic),
        platform: requireText(input.platform ?? 'TikTok', 'platform', INPUT_LIMITS.platform),
        audience: optionalText(input.audience, INPUT_LIMITS.audience),
        objective: optionalText(input.objective, INPUT_LIMITS.objective),
      }
    default:
      throw new Error('Unknown tool.')
  }
}

// ------------------------------------------------------------
// Anti-spam UX : intervalle minimum entre deux gÃ©nÃ©rations
// (la protection de sÃ©curitÃ© rÃ©elle est cÃ´tÃ© serveur)
// ------------------------------------------------------------
let minGenerateIntervalMs = 2000
let lastGenerateAt = 0

export function setMinGenerateInterval(ms) {
  minGenerateIntervalMs = ms
}

function slug(text) {
  return text.trim().split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '') || 'topic'
}

function mockGenerate(toolId, params) {
  switch (toolId) {
    case 'hook':
      return [
        `Stop making this mistake with ${params.topic} in 2026!`,
        `Nobody is talking about this ${params.topic} hack...`,
        `If I had to restart ${params.topic} from scratch, I'd do this.`,
        `The truth about ${params.topic} that nobody tells you.`,
        `3 seconds to understand ${params.topic} (worth it).`,
      ].join('\n')
    case 'script':
      return [
        `[HOOK 0-3s] â€” Pose the question everyone asks about ${params.topic}.`,
        ``,
        `[BODY 3-${Math.round(params.duration * 0.6)}s] â€” 3 key points, one per shot, fast pace.`,
        ``,
        `[CLIMAX ${Math.round(params.duration * 0.6)}-${params.duration - 5}s] â€” The reveal or the plot twist.`,
        ``,
        `[CTA ${params.duration - 5}-${params.duration}s] â€” "Follow for part 2!"`,
        ``,
        `_Demo mode: connect Supabase for real AI generations._`,
      ].join('\n')
    case 'hashtag': {
      const tag = slug(params.niche)
      return [
        `Broad: #${tag.toLowerCase()} #viral #fyp #foryou #tips #learnontiktok #business #mindset #reels #shorts`,
        ``,
        `Medium: #${tag.toLowerCase()}tips #dailytips #viralcontent #creatoreconomy #growthhacks #digitalmarketing #entrepreneurlife #contentstrategy #audiencegrowth #socialmediatips`,
        ``,
        `Niche: #${tag.toLowerCase()}${params.platform.split(' ')[0].toLowerCase()} #${tag.toLowerCase()}2026 #${tag.toLowerCase()}forbeginners #${tag.toLowerCase()}community`,
        ``,
        `_Demo mode: connect Supabase for real AI generations._`,
      ].join('\n')
    }
    case 'title':
      return [
        `**Score: 62/100** — decent title but too generic.`,
        ``,
        `**Analysis:**`,
        `- Too long, risk of truncation`,
        `- No clear benefit for the viewer`,
        `- Not enough curiosity`,
        ``,
        `**Variants:**`,
        `1. I tested X: here's what nobody tells you`,
        `2. The X method in 3 steps (step 2 changes everything)`,
        `3. Why your X isn't working (and the 1-minute fix)`,
        ``,
        `_Demo mode: connect Supabase for real AI generations._`,
      ].join('\n')
    case 'pack': {
      const nicheTag = slug(params.topic).toLowerCase() || 'topic'
      return {
        hooks: [
          { text: `Stop making this mistake with ${params.topic} in 2026!`, visual: 'Red text overlay, finger pointing at camera' },
          { text: `Nobody is talking about this ${params.topic} hack...`, visual: 'Quick zoom on face, whisper tone' },
          { text: `If I had to restart ${params.topic} from scratch, I'd do this.`, visual: 'Screen recording of notes app' },
          { text: `The truth about ${params.topic} that nobody tells you.`, visual: 'Shake head, cut to b-roll' },
          { text: `3 seconds to understand ${params.topic} (worth it).`, visual: 'Countdown numbers on screen' },
        ],
        script: {
          intro: `Here is the promise: master ${params.topic} without wasting time.`,
          body: `Three key points, one per shot: the mistake everyone makes, the fix, and the result you can expect in 7 days.`,
          broll_ideas: ['Phone screen close-up', 'Product or workspace b-roll', 'Before/after split screen'],
          cta: 'Save this video for later and follow for part 2!',
        },
        seo_title: `The ${params.topic} method in 3 steps`,
        hashtags: [`#${nicheTag}`, '#tips', '#viral', '#fyp', '#learnontiktok', `#${nicheTag}tips`, '#dailytips', `#${nicheTag}2026`],
        next_ideas: [
          `Common mistakes in ${params.topic}.`,
          `My ${params.topic} routine, step by step.`,
          `I tested ${params.topic} for 7 days.`,
        ],
      }
    }
    default:
      throw new Error(`Unknown tool: ${toolId}`)
  }
}

async function throwInvokeError(error) {
  let kind = ''
  try {
    if (error instanceof FunctionsHttpError) {
      const payload = await error.context.json()
      kind = typeof payload?.error === 'string' ? payload.error : ''
    }
  } catch {
    /* body illisible -> erreur gÃ©nÃ©rique */
  }
  if (kind === 'credits' || /credit/i.test(error.message ?? '')) {
    throw new Error('Not enough credits. Please upgrade to PRO.')
  }
  if (kind === 'rate_limit' || /rate limit|too many/i.test(error.message ?? '')) {
    throw new Error('Rate limit exceeded. Please wait a moment.')
  }
  if (kind === 'unauthorized') {
    throw new Error('Session expired. Please log in again.')
  }
  console.error('[generate] invoke failed:', error)
  throw new Error('AI API error')
}

export async function generate(toolId, params) {
  const tool = getTool(toolId)
  if (!tool) {
    throw new Error('Unknown tool.')
  }

  const now = Date.now()
  if (minGenerateIntervalMs > 0 && now - lastGenerateAt < minGenerateIntervalMs) {
    throw new Error('Rate limit exceeded. Please wait a moment.')
  }
  lastGenerateAt = now

  // Seuls les champs validÃ©s quittent le frontend
  const safeParams = validateParams(toolId, params)

  // Mode dÃ©mo : aucun backend configurÃ©
  if (!isSupabaseConfigured || !supabase) {
    await new Promise((r) => setTimeout(r, 600))
    return mockGenerate(toolId, safeParams)
  }

  // Production : Edge Function (auth JWT + validation + crÃ©dits + secrets)
  const { data, error } = await supabase.functions.invoke('generate', {
    body: {
      tool: toolId,
      language: resolveLanguage(),
      input: safeParams,
    },
  })
  if (error) await throwInvokeError(error)

  const content = data?.result
  const isStructuredObject =
    content && typeof content === 'object' && !Array.isArray(content)
  if (isStructuredObject) return content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI API error')
  }
  return content
}

export { isSupabaseConfigured }
