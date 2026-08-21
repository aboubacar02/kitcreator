import { isSupabaseConfigured } from './supabase.js'
import { resolveLanguage } from './language.js'
import { SYSTEM_PROMPT, buildToolPrompt, validateOutput } from '../prompts/index.js'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

const DEFAULT_URL = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini'

function resolveProvider(key) {
  if (/^(AIza|AQ\.)/.test(key)) {
    return {
      url: GEMINI_URL,
      model: import.meta.env.VITE_AI_MODEL_GEMINI || 'gemini-3.6-flash',
    }
  }
  if (key.startsWith('gsk_')) {
    return {
      url: GROQ_URL,
      model: import.meta.env.VITE_AI_MODEL_GROQ || 'openai/gpt-oss-120b',
    }
  }
  return { url: DEFAULT_URL, model: DEFAULT_MODEL }
}

const API_KEYS = [
  import.meta.env.VITE_AI_API_KEY,
  import.meta.env.VITE_AI_KEY_1,
  import.meta.env.VITE_AI_KEY_2,
  import.meta.env.VITE_AI_KEY_3,
  import.meta.env.VITE_AI_KEY_4,
  import.meta.env.VITE_AI_KEY_5,
  import.meta.env.VITE_AI_KEY_6,
].filter(Boolean)

let currentKeyIndex = 0

function getNextApiKey() {
  const key = API_KEYS[currentKeyIndex]
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
  return key
}

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
]

export function getTool(id) {
  return TOOLS.find((t) => t.id === id)
}

async function callApiWithKey(prompt, systemContent, apiKey) {
  const { url, model } = resolveProvider(apiKey)
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    }),
  })
  if (!res.ok) {
    const error = new Error(`AI API error (${res.status})`)
    error.status = res.status
    throw error
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callApi(prompt, systemContent) {
  let lastError
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    try {
      return await callApiWithKey(prompt, systemContent, getNextApiKey())
    } catch (err) {
      lastError = err
      const retryable =
        !err.status ||
        [401, 403, 429].includes(err.status) ||
        err.status >= 500
      if (!retryable) throw err
    }
  }
  throw lastError
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
        `[HOOK 0-3s] — Pose the question everyone asks about ${params.topic}.`,
        ``,
        `[BODY 3-${Math.round(params.duration * 0.6)}s] — 3 key points, one per shot, fast pace.`,
        ``,
        `[CLIMAX ${Math.round(params.duration * 0.6)}-${params.duration - 5}s] — The reveal or the plot twist.`,
        ``,
        `[CTA ${params.duration - 5}-${params.duration}s] — "Follow for part 2!"`,
        ``,
        `_Demo mode: set VITE_AI_API_KEY for full generations._`,
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
        `_Demo mode: set VITE_AI_API_KEY for full generations._`,
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
        `_Demo mode: set VITE_AI_API_KEY for full generations._`,
      ].join('\n')
    default:
      throw new Error(`Unknown tool: ${toolId}`)
  }
}

export async function generate(toolId, params) {
  const prompt = buildToolPrompt(toolId, params)
  if (API_KEYS.length === 0) {
    await new Promise((r) => setTimeout(r, 600))
    return mockGenerate(toolId, params)
  }
  const result = await callApi(prompt, SYSTEM_PROMPT(resolveLanguage()))
  return validateOutput(toolId, result)
}

export { isSupabaseConfigured }
