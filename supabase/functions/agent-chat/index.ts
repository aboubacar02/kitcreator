// ============================================================
// KitCreator — Edge Function "agent-chat" (KitBot)
//
// Le Directeur Artistique IA du créateur :
//   - Mémoire de style : lit creator_profiles (RLS, JWT uniquement)
//   - Dialogue multi-tours : historique fourni par le client,
//     tronqué/validé côté serveur (jamais cru)
//   - Crédits : 1 crédit/message via consume_credits durcie
//     (rate limit 30/h inclus), remboursement si échec IA
//   - Erreurs génériques au client, détails dans les logs
// ============================================================

import { SYSTEM_PROMPT } from '../../../src/prompts/systemPrompt.js'
import {
  corsHeaders,
  json,
  requireAuth,
  generateWithProviders,
  type ChatMessage,
} from '../_shared/ai.ts'

const ALLOWED_LANGUAGES = ['fr', 'en', 'es']
const AGENT_COST = 1
const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 12
const MAX_HISTORY_MESSAGE_LENGTH = 1500

function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (m): m is { role: string; content: string } =>
        m && typeof m === 'object' &&
        typeof (m as Record<string, unknown>).content === 'string',
    )
    .map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content.replace(/\s+/g, ' ').trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH),
    }))
    .filter((m) => m.content)
    .slice(-MAX_HISTORY_MESSAGES)
}

interface CreatorProfile {
  brand_name?: string | null
  niche?: string | null
  target_audience?: string | null
  content_tone?: string | null
  favorite_formats?: string[] | null
  custom_instructions?: string | null
}

const clean = (value: unknown, max = 300): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

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

    // 2. Validation stricte du message et de l'historique
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json(req, 400, { error: 'invalid' })
    }

    const rawLanguage = typeof body.language === 'string' ? body.language.trim() : 'fr'
    const language = ALLOWED_LANGUAGES.includes(rawLanguage) ? rawLanguage : 'fr'

    const message =
      typeof body.message === 'string'
        ? body.message.replace(/\s+/g, ' ').trim().slice(0, MAX_MESSAGE_LENGTH)
        : ''
    if (!message) {
      return json(req, 400, { error: 'invalid' })
    }
    const history = sanitizeHistory(body.history)

    // 3. Crédits + rate limiting (la RPC durcie fait tout, atomiquement)
    const { data: remaining, error: creditError } = await userClient.rpc(
      'consume_credits',
      { p_user_id: user.id, p_amount: AGENT_COST },
    )
    if (creditError) {
      const msg = creditError.message ?? ''
      console.error('[agent-chat] consume_credits failed:', msg)
      if (/Not enough credits/i.test(msg)) {
        return json(req, 402, { error: 'credits' })
      }
      if (/Rate limit/i.test(msg)) {
        return json(req, 429, { error: 'rate_limit' })
      }
      return json(req, 500, { error: 'generic' })
    }

    // 4. Mémoire du style : profil du créateur via RLS (sa ligne seulement)
    let profile: CreatorProfile = {}
    try {
      const { data } = await userClient
        .from('creator_profiles')
        .select(
          'brand_name, niche, target_audience, content_tone, favorite_formats, custom_instructions',
        )
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) profile = data as CreatorProfile
    } catch (profileErr) {
      // Profil absent ou illisible -> l'agent fonctionne sans mémoire
      console.error('[agent-chat] profile load failed:', profileErr)
    }

    const brandLine = clean(profile.brand_name)
    const nicheLine = clean(profile.niche)
    const audienceLine = clean(profile.target_audience)
    const toneLine = clean(profile.content_tone, 60)
    const formatsLine = Array.isArray(profile.favorite_formats)
      ? profile.favorite_formats.map((f) => clean(f, 60)).filter(Boolean).join(', ')
      : ''
    const instructionsLine = clean(profile.custom_instructions, 500)

    const kitbotPersona = [
      'You are "KitBot", the AI Content Director for short-form video creators (TikTok, Reels, Shorts).',
      'Your role: advise the creator, sharpen their hooks and scripts, find viral angles and help them structure their shooting week.',
      'Be concise, dynamic and extremely concrete. Give ready-to-use text, not abstract advice.',
      '',
      '<creator_profile>',
      `- Brand: ${brandLine || 'not set'}`,
      `- Niche: ${nicheLine || 'not set yet, ask about it if relevant'}`,
      `- Target audience: ${audienceLine || 'general audience'}`,
      `- Usual tone: ${toneLine || 'energetic'}`,
      `- Favorite formats: ${formatsLine || 'not set'}`,
      `- Standing instructions from the creator (HIGHEST PRIORITY, always respect them): ${instructionsLine || 'none'}`,
      '</creator_profile>',
    ].join('\n')

    // 5. Génération (secrets serveur uniquement), remboursement si échec
    try {
      const reply = await generateWithProviders(
        message,
        `${SYSTEM_PROMPT(language)}\n\n${kitbotPersona}`,
        history,
      )
      if (!reply.trim()) {
        throw new Error('empty generation')
      }
      return json(req, 200, {
        ok: true,
        reply,
        credits_left: typeof remaining === 'number' ? remaining : null,
      })
    } catch (genErr) {
      console.error('[agent-chat] generation failed, refunding:', genErr)
      const { error: refundError } = await serviceClient.rpc('refund_credits', {
        p_user_id: user.id,
        p_amount: AGENT_COST,
      })
      if (refundError) {
        console.error('[agent-chat] refund failed:', refundError.message)
      }
      return json(req, 502, { error: 'generic' })
    }
  } catch (err) {
    console.error('[agent-chat] unexpected error:', err)
    return json(req, 500, { error: 'generic' })
  }
})
