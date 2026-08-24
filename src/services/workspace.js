import { supabase, isSupabaseConfigured } from './supabase.js'

function requireClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.')
  }
}

export async function getProjects() {
  requireClient()
  const { data, error } = await supabase
    .from('saved_projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProject(id) {
  requireClient()
  const { data, error } = await supabase
    .from('saved_projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function updateStatus(id, status) {
  requireClient()
  const allowed = ['draft', 'done', 'archived']
  if (!allowed.includes(status)) throw new Error('Invalid status.')
  const { data, error } = await supabase
    .from('saved_projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleFavorite(id, current) {
  requireClient()
  const { data, error } = await supabase
    .from('saved_projects')
    .update({ is_favorite: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  requireClient()
  const { error } = await supabase.from('saved_projects').delete().eq('id', id)
  if (error) throw error
}
