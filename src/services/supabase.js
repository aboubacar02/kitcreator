import { createClient } from '@supabase/supabase-js'

// IMPORTANT : accès statique aux variables d'environnement uniquement.
// `import.meta.env` utilisé comme objet entier (ou indexé dynamiquement)
// ferait inliner TOUT le .env.local dans le bundle (fuite de clés).
// Le try/catch rend le module chargeable sous Node pur (tests).
let supabaseUrl
let supabaseAnonKey
try {
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
} catch {
  /* Node sans Vite : mode démo */
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function getSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthStateChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) =>
    callback(event, session),
  )
  return () => data.subscription.unsubscribe()
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase non configuré')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/dashboard' },
  })
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function getProfile(userId) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, credits')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export async function ensureProfile(user) {
  if (!supabase) return null
  const existing = await getProfile(user.id)
  if (existing) return existing
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
    .select('id, email, credits')
    .single()
  if (error) return null
  return data
}

export async function consumeCredits(userId, amount) {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.rpc('consume_credits', {
    p_user_id: userId,
    p_amount: amount,
  })
  if (error) throw error
  return data
}
