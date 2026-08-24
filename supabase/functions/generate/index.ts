// ============================================================
// KitCreator — Edge Function "generate"
//
// Architecture cible : le frontend n'appelle PLUS les fournisseurs IA.
//   React -> POST /functions/v1/generate -> secrets serveur -> fournisseur
//
// Responsabilités (dans l'ordre) :
//   1. CORS restreint aux origines de l'app
//   2. Authentification : identité déduite du JWT Supabase UNIQUEMENT
//      (jamais d'un user_id envoyé dans le body)
//   3. Validation serveur des entrées (miroir de INPUT_LIMITS frontend)
//   4. Crédits : RPC consomm_credits durcie (atomique + rate limit 30/h)
//   5. Prompts : SYSTEM_PROMPT > TOOL PROMPT > <user_data> (anti-injection)
//   6. Appel fournisseur avec SECRET SERVEUR uniquement
//   7. Remboursement automatique si tous les fournisseurs échouent
//   8. Erreurs génériques au client, détails seulement dans les logs
// ============================================================

import { SYSTEM_PROMPT } from '../../../src/prompts/systemPrompt.js'
import { buildToolPrompt } from '../../../src/prompts/index.js'
import { validateOutput, parseStructuredPack } from '../../../src/prompts/validators.js'
import {
  corsHeaders,
  json,
  requireAuth,
  generateWithProviders,
} from '../_shared/ai.ts'

// ------------------------------------------------------------
// Validation serveur (source de vérité ; miroir du frontend)
// ------------------------------------------------------------
const LIMITS = { topic: 300, niche: 150, title: 300, platform: 40, audience: 160, objective: 160, keywords: 180 }
const ALLOWED_DURATIONS = ['15', '30', '60']
const ALLOWED_TONES = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']
const ALLOWED_STYLES = ['Educational', 'Storytelling', 'Funny', 'Persuasive']
const ALLOWED_LANGUAGES = ['fr', 'en', 'es']

// Coûts en crédits — DOIT rester aligné avec TOOLS côté frontend
const TOOL_COSTS: Record<string, number> = {
  hook: 1,
  script: 2,
  hashtag: 1,
  title: 1,
  pack: 4,
}

class InvalidInput extends Error {}

function requireText(value: unknown, name: string, maxLength: number): string {
  if (typeof value !== 'string') throw new InvalidInput(`Invalid ${name}.`)
  const cleaned = value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
  if (!cleaned) throw new InvalidInput(`Invalid ${name}.`)
  return cleaned
}

function requireOneOf(value: unknown, name: string, allowed: string[]): string {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!allowed.includes(raw)) throw new InvalidInput(`Invalid ${name}.`)
  return raw
}

function optionalText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

interface SafeInput {
  [key: string]: string | number
}

function validateInput(tool: string, input: unknown): SafeInput {
  const raw = input && typeof input === 'object' ? input as Record<string, unknown> : {}
  switch (tool) {
    case 'hook':
      return {
        topic: requireText(raw.topic, 'topic', LIMITS.topic),
        platform: requireText(raw.platform ?? 'TikTok', 'platform', LIMITS.platform),
        tone: requireOneOf(raw.tone ?? 'Energetic', 'tone', ALLOWED_TONES),
      }
    case 'script': {
      const durationRaw = String(raw.duration ?? '30')
      if (!ALLOWED_DURATIONS.includes(durationRaw)) throw new InvalidInput('Invalid duration.')
      return {
        topic: requireText(raw.topic, 'topic', LIMITS.topic),
        duration: Number(durationRaw),
        style: requireOneOf(raw.style ?? 'Educational', 'style', ALLOWED_STYLES),
        audience: optionalText(raw.audience, LIMITS.audience),
        objective: optionalText(raw.objective, LIMITS.objective),
      }
    }
    case 'hashtag':
      return {
        niche: requireText(raw.niche, 'niche', LIMITS.niche),
        platform: requireText(raw.platform ?? 'TikTok', 'platform', LIMITS.platform),
        keywords: optionalText(raw.keywords, LIMITS.keywords),
      }
    case 'title':
      return {
        title: requireText(raw.title, 'title', LIMITS.title),
      }
    case 'pack':
      return {
        topic: requireText(raw.topic, 'topic', LIMITS.topic),
        platform: requireText(raw.platform ?? 'TikTok', 'platform', LIMITS.platform),
        audience: optionalText(raw.audience, LIMITS.audience),
        objective: optionalText(raw.objective, LIMITS.objective),
      }
    default:
      throw new InvalidInput('Unknown tool.')
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }
  if (req.method !== 'POST') {
    return json(req, 405, { error: 'method_not_allowed' })
  }

  try {
    // 1. Identité : déduite du JWT, jamais du body
    const auth = await requireAuth(req)
    if (!auth) {
      return json(req, 401, { error: 'unauthorized' })
    }
    const { user, userClient, serviceClient } = auth

    // 2. Validation serveur stricte
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json(req, 400, { error: 'invalid' })
    }

    const tool = typeof body.tool === 'string' ? body.tool : ''
    const cost = TOOL_COSTS[tool]
    if (!cost) {
      return json(req, 400, { error: 'invalid' })
    }
    const language = requireOneOf(body.language ?? 'fr', 'language', ALLOWED_LANGUAGES)
    let safeInput: SafeInput
    try {
      safeInput = validateInput(tool, body.input)
    } catch (err) {
      if (err instanceof InvalidInput) {
        return json(req, 400, { error: 'invalid' })
      }
      throw err
    }

    // 3. Crédits + rate limiting : la RPC durcie fait tout, atomiquement
    //    (verrou ligne FOR UPDATE -> résiste aux requêtes concurrentes).
    const { data: remaining, error: creditError } = await userClient.rpc(
      'consume_credits',
      { p_user_id: user.id, p_amount: cost },
    )
    if (creditError) {
      const msg = creditError.message ?? ''
      console.error('[generate] consume_credits failed:', msg)
      if (/Not enough credits/i.test(msg)) {
        return json(req, 402, { error: 'credits' })
      }
      if (/Rate limit/i.test(msg)) {
        return json(req, 429, { error: 'rate_limit' })
      }
      if (/Forbidden|Invalid/i.test(msg)) {
        return json(req, 400, { error: 'invalid' })
      }
      return json(req, 500, { error: 'generic' })
    }

    // 4. Génération (secrets serveur uniquement). En cas d'échec total
    //    après débit, on rembourse (best-effort) avant de répondre.
    try {
      const raw = await generateWithProviders(
        buildToolPrompt(tool, safeInput),
        SYSTEM_PROMPT(language),
      )
      const result = tool === 'pack' ? parseStructuredPack(raw) : validateOutput(tool, raw)
      if (!result || (typeof result === 'string' && !result.trim())) {
        throw new Error('empty generation')
      }
      return json(req, 200, {
        ok: true,
        result,
        credits_left: typeof remaining === 'number' ? remaining : null,
      })
    } catch (genErr) {
      console.error('[generate] generation failed, refunding:', genErr)
      const { error: refundError } = await serviceClient.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: cost,
      })
      if (refundError) {
        console.error('[generate] REFUND FAILED:', refundError.message)
      }
      return json(req, 502, { error: 'generic' })
    }
  } catch (err) {
    console.error('[generate] unexpected:', err)
    return json(req, 500, { error: 'generic' })
  }
})
