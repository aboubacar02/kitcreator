// ============================================================
// KitCreator — Edge Function "weekly-briefing"
//
// Veille hebdomadaire "à la connexion" :
//   - 1 seul briefing par utilisateur et par semaine (index unique
//     uq_briefing_week côté base -> aucun doublon possible)
//   - Gratuit : aucune consommation de crédits (hook de rétention)
//   - Personnalisé via creator_profiles (RLS, JWT uniquement)
//   - Le résultat est sauvegardé dans saved_projects (type 'briefing')
//     donc visible dans le Workspace
// ============================================================

import { SYSTEM_PROMPT } from '../../../src/prompts/systemPrompt.js'
import { briefingPrompt } from '../../../src/prompts/briefingPrompt.js'
import {
  corsHeaders,
  json,
  requireAuth,
  generateWithProviders,
  logUsage,
} from '../_shared/ai.ts'

function currentWeekStart(): string {
  const now = new Date()
  // Lundi ISO, UTC
  const day = now.getUTCDay()
  const diff = (day === 0 ? 6 : day - 1)
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff))
  return monday.toISOString().slice(0, 10)
}

const clean = (value: unknown, max = 300): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

interface CreatorProfile {
  brand_name?: string | null
  niche?: string | null
  target_audience?: string | null
  content_tone?: string | null
  custom_instructions?: string | null
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(req) })
  }
  if (req.method !== 'POST') {
    return json(req, 405, { error: 'method_not_allowed' })
  }

  try {
    const auth = await requireAuth(req)
    if (!auth) {
      return json(req, 401, { error: 'unauthorized' })
    }
    const { user, userClient } = auth

    let body: Record<string, unknown> = {}
    try {
      body = await req.json()
    } catch {
      /* body optionnel */
    }
    const rawLanguage = typeof body.language === 'string' ? body.language.trim() : 'fr'
    const language = ['fr', 'en', 'es'].includes(rawLanguage) ? rawLanguage : 'fr'

    const weekStart = currentWeekStart()

    // 1. Briefing déjà généré cette semaine ? (protégé aussi par l'index unique)
    let existing: { title?: string; content?: Record<string, unknown> } | null = null
    try {
      const { data } = await userClient
        .from('saved_projects')
        .select('title, content')
        .eq('user_id', user.id)
        .eq('type', 'briefing')
        .eq('content->>week_start', weekStart)
        .maybeSingle()
      existing = data as typeof existing
    } catch (checkErr) {
      console.error('[weekly-briefing] lookup failed:', checkErr)
    }
    if (existing?.content) {
      return json(req, 200, {
        ok: true,
        created: false,
        briefing: existing.content,
        title: existing.title ?? null,
      })
    }

    // 2. Mémoire du style
    let profile: CreatorProfile = {}
    try {
      const { data } = await userClient
        .from('creator_profiles')
        .select('brand_name, niche, target_audience, content_tone, custom_instructions')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) profile = data as CreatorProfile
    } catch (profileErr) {
      console.error('[weekly-briefing] profile load failed:', profileErr)
    }

    // 3. Génération (secrets serveur uniquement, gratuite pour l'utilisateur)
    let ideas: string
    try {
      ideas = await generateWithProviders(
        briefingPrompt({
          niche: clean(profile.niche),
          audience: clean(profile.target_audience),
          tone: clean(profile.content_tone, 60),
          instructions: clean(profile.custom_instructions, 500),
        }),
        SYSTEM_PROMPT(language),
      )
    } catch (genErr) {
      console.error('[weekly-briefing] generation failed:', genErr)
      // Pas de génération -> pas de bannière ; le client réessaiera plus tard.
      return json(req, 502, { error: 'generic' })
    }
    if (!ideas.trim()) {
      return json(req, 502, { error: 'generic' })
    }

    logUsage(userClient, user.id, 'briefing', language)

    // 4. Sauvegarde Workspace (l'index unique absorbe les courses concurrentes)
    const row = {
      user_id: user.id,
      title: `Briefing — ${weekStart}`,
      type: 'briefing',
      status: 'draft',
      platform: 'TikTok',
      niche: clean(profile.niche),
      topic: '',
      content: { week_start: weekStart, ideas },
    }
    const { error: insertError } = await userClient
      .from('saved_projects')
      .insert(row)
      .select('id')
      .maybeSingle()

    let created = true
    if (insertError) {
      // 23505 = violation de l'index unique : un briefing existe déjà
      // (course entre deux onglets). On renvoie sereinement le statu quo.
      if ((insertError as { code?: string }).code === '23505') {
        created = false
      } else {
        console.error('[weekly-briefing] insert failed:', insertError.message)
        // Le briefing reste utilisable même si la sauvegarde échoue.
      }
    }

    return json(req, 200, {
      ok: true,
      created,
      briefing: { week_start: weekStart, ideas },
      title: row.title,
    })
  } catch (err) {
    console.error('[weekly-briefing] unexpected error:', err)
    return json(req, 500, { error: 'generic' })
  }
})
