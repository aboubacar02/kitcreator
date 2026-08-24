import { supabase, isSupabaseConfigured } from './supabase.js'

const DEMO_BRIEFING = [
  '1. **Le défi 7 jours** — "J\'ai testé pendant 7 jours, voilà ce qui a vraiment changé."',
  '2. **L\'erreur n°1 de ta niche** — "Arrête de faire ça si tu veux progresser."',
  '3. **Avant / après** — montre un résultat concret en split screen.',
  '4. **Le contre-pied** — "Tout le monde te dit de faire X ? Fais plutôt Y."',
  '5. **Les coulisses** — "Voici comment je prépare mes vidéos en 20 minutes."',
].join('\n')

export async function getWeeklyBriefing() {
  // Mode démo : aucun backend configuré
  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, created: false, briefing: { ideas: DEMO_BRIEFING } }
  }

  const { data, error } = await supabase.functions.invoke('weekly-briefing', {
    body: {},
  })
  if (error) throw error
  if (data?.ok !== true || typeof data?.briefing?.ideas !== 'string') {
    throw new Error('AI API error')
  }
  return data
}
