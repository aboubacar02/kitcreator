// ============================================================
// KitCreator — code partagé entre les Edge Functions
//
// Contient les briques de sécurité et d'appel IA :
//   - CORS restreint aux origines de l'app (jamais *)
//   - Réponses JSON homogènes
//   - Authentification : identité déduite du JWT UNIQUEMENT
//   - Cascade fournisseurs : rotation multi-clés/comptes,
//     fallback de modèles, secrets serveur uniquement
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
export const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

export const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://kitcreator-beta.vercel.app',
]

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin')
  const allow = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

export function json(req: Request, status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders(req), 'Content-Type': 'application/json' },
  })
}

export interface AuthContext {
  user: { id: string }
  userClient: ReturnType<typeof createClient>
  serviceClient: ReturnType<typeof createClient>
}

// Identité TOUJOURS déduite du JWT Supabase — jamais d'un user_id du body.
// userClient : JWT transmis à Postgres -> RLS s'applique.
// serviceClient : réservé au remboursement (refund_credits est verrouillé
// sur ce rôle côté base).
export async function requireAuth(req: Request): Promise<AuthContext | null> {
  const authHeader = req.headers.get('Authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return null

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const { data, error } = await authClient.auth.getUser(token)
  const user = data?.user
  if (error || !user) return null

  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  if (!SERVICE_ROLE_KEY) {
    console.error('[_shared] SUPABASE_SERVICE_ROLE_KEY manquant')
    return null
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return { user, userClient, serviceClient }
}

// ------------------------------------------------------------
// Fournisseurs IA — SECRETS SERVEUR uniquement.
//
// Rotation multi-clés : chaque fournisseur accepte plusieurs clés
// de COMPTES DISTINCTS (GEMINI_API_KEY, GEMINI_API_KEY_2..6, etc.).
// En cas d'échec (quota, indispo), clé suivante, puis modèle suivant,
// puis fournisseur suivant. Plusieurs clés du MÊME compte
// n'augmentent pas le quota.
// ------------------------------------------------------------
interface Provider {
  name: string
  url: string
  model: string
  key: string
}

const MAX_KEYS_PER_PROVIDER = 6

function collectKeys(prefix: string): string[] {
  const keys: string[] = []
  const primary = Deno.env.get(`${prefix}_API_KEY`)
  if (primary) keys.push(primary)
  for (let i = 2; i <= MAX_KEYS_PER_PROVIDER; i++) {
    const extra = Deno.env.get(`${prefix}_API_KEY_${i}`)
    if (extra && !keys.includes(extra)) keys.push(extra)
  }
  return keys
}

function dedupeModels(models: Array<string | undefined>): string[] {
  return [...new Set(models.filter((m): m is string => Boolean(m)))]
}

function availableAttempts(): Provider[] {
  const defs = [
    {
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      models: dedupeModels([
        Deno.env.get('GEMINI_MODEL'),
        'gemini-3.6-flash',
        'gemini-flash-latest',
        'gemini-2.5-flash',
      ]),
    },
    {
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      models: dedupeModels([
        Deno.env.get('GROQ_MODEL'),
        'openai/gpt-oss-120b',
      ]),
    },
    {
      name: 'openai',
      url: 'https://api.openai.com/v1/chat/completions',
      models: dedupeModels([
        Deno.env.get('OPENAI_MODEL'),
        'gpt-4o-mini',
      ]),
    },
  ]
  const list: Provider[] = []
  for (const def of defs) {
    collectKeys(def.name.toUpperCase()).forEach((key, idx) => {
      const keyLabel = idx === 0 ? def.name : `${def.name}#${idx + 1}`
      def.models.forEach((model, mIdx) => {
        list.push({
          name: mIdx === 0 ? keyLabel : `${keyLabel}/${model}`,
          url: def.url,
          model,
          key,
        })
      })
    })
  }
  return list
}

async function callProvider(
  provider: Provider,
  prompt: string,
  systemContent: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const res = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemContent },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) {
    // On ne remonte JAMAIS le corps du fournisseur au client
    throw new Error(`${provider.name} error (${res.status})`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function generateWithProviders(
  prompt: string,
  systemContent: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const attempts = availableAttempts()
  if (attempts.length === 0) {
    throw new Error('no provider configured')
  }
  let lastError: unknown
  for (const attempt of attempts) {
    try {
      return await callProvider(attempt, prompt, systemContent, history)
    } catch (err) {
      lastError = err
      console.error(`[_shared] attempt "${attempt.name}" failed:`, err)
    }
  }
  throw lastError instanceof Error ? lastError : new Error('all providers failed')
}
