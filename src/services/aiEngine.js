import { isSupabaseConfigured } from './supabase.js'

const API_URL = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const API_KEY = import.meta.env.VITE_AI_API_KEY || ''
const MODEL = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini'

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

function buildPrompt(toolId, params) {
  switch (toolId) {
    case 'hook':
      return `You are a viral content expert. Generate 5 scroll-stopping hooks in English for a ${params.platform} video about "${params.topic}". Tone: ${params.tone}. Each hook must be under 15 words and make viewers want to stay. Reply with a numbered list only, no extra commentary.`
    case 'script':
      return `You are a viral short-form video scriptwriter. Write a structured script in English for a ${params.duration}-second video about "${params.topic}", in a ${params.style} style. Structure: Hook (0-3s), Body, Climax, Call-to-action. Include timecodes. Reply in light markdown only, no extra commentary.`
    case 'hashtag':
      return `You are an organic growth expert. For the niche "${params.niche}" on ${params.platform}, suggest 30 hashtags in English split into 3 groups: 10 broad (high volume), 10 medium, 10 niche. Reply with 3 lists separated by blank lines only, no extra commentary.`
    case 'title':
      return `You are a YouTube copywriting expert. Analyze this title: "${params.title}". Provide: 1) a click-potential score out of 100, 2) 3 quick strengths/weaknesses, 3) 5 more clickable variants. Reply in English, light markdown format, no extra commentary.`
    default:
      throw new Error(`Unknown tool: ${toolId}`)
  }
}

async function callApi(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    }),
  })
  if (!res.ok) {
    throw new Error(`AI API error (${res.status})`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
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
  const prompt = buildPrompt(toolId, params)
  if (!API_KEY) {
    await new Promise((r) => setTimeout(r, 600))
    return mockGenerate(toolId, params)
  }
  return callApi(prompt)
}

export { isSupabaseConfigured }
