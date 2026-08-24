import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import CopyButton from '../components/CopyButton.jsx'
import {
  getSession,
  ensureProfile,
  getProfile,
  signOut,
  onAuthStateChange,
  isSupabaseConfigured,
} from '../services/supabase.js'
import {
  getLocalCredits,
  consumeLocalCredits,
} from '../services/credits.js'
import { getTool } from '../services/aiEngine.js'
import { getWeeklyBriefing } from '../services/briefing.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function Dashboard() {
  const { t } = useI18n()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [localCredits, setLocalCredits] = useState(getLocalCredits())
  const [loading, setLoading] = useState(true)
  const [briefing, setBriefing] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let mounted = true

    async function loadBriefing() {
      try {
        const data = await getWeeklyBriefing()
        if (mounted && data?.briefing?.ideas) {
          setBriefing(data.briefing)
        }
      } catch {
        /* pas de briefing -> pas de banniÃ¨re ; rÃ©essaie Ã  la prochaine connexion */
      }
    }

    async function init() {
      const currentSession = await getSession()
      if (!mounted) return
      setSession(currentSession)
      if (currentSession?.user) {
        const userProfile = await ensureProfile(currentSession.user)
        if (mounted) setProfile(userProfile)
        loadBriefing()
      }
      setLoading(false)
    }

    init()

    const unsubscribe = onAuthStateChange((event, newSession) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setProfile(null)
        navigate('/auth')
        return
      }
      if (newSession) {
        setSession(newSession)
        if (
          event === 'SIGNED_IN' &&
          window.location.hash.includes('access_token')
        ) {
          window.history.replaceState(
            null,
            '',
            window.location.pathname + window.location.search,
          )
        }
        ensureProfile(newSession.user).then((p) => {
          if (mounted) setProfile(p)
        })
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
  }, [navigate])

  async function refreshCredits(toolId) {
    // Le dÃ©bit rÃ©el est fait cÃ´tÃ© serveur (Edge Function) ; ici on
    // resynchronise l'affichage, ou on dÃ©bite localement en mode dÃ©mo.
    try {
      if (isSupabaseConfigured && session?.user?.id) {
        const updated = await getProfile(session.user.id)
        if (updated) setProfile(updated)
      } else if (toolId) {
        setLocalCredits(consumeLocalCredits(getTool(toolId).credits))
      }
    } catch {
      /* rafraÃ®chissement best-effort */
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-brand-500" />
      </div>
    )
  }

  if (isSupabaseConfigured && !session) {
    return <Navigate to="/auth" replace />
  }

  const user = session?.user ?? { id: 'demo', email: 'demo@kitcreator.app' }
  const credits = isSupabaseConfigured ? (profile?.credits ?? 0) : localCredits

  return (
    <div className="flex min-h-screen flex-col text-zinc-950">
      <Navbar credits={credits} onSignOut={handleSignOut} />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar user={user} />
        <main className="mx-auto w-full max-w-4xl flex-1 p-6 md:p-10">
          {!isSupabaseConfigured && (
            <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {t('demo.notice')}
            </p>
          )}
          {isSupabaseConfigured && !profile && (
            <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {t('setup.profileMissing')}
            </p>
          )}
          {briefing?.ideas && (
            <details data-background-lock className="mb-6 rounded-xl border border-brand-100 bg-brand-50/60 p-5 shadow-sm">
              <summary className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-semibold text-zinc-950">
                <CalendarDays className="h-4.5 w-4.5 shrink-0 text-brand-600" />
                {t('brief.title')}
                <span className="ml-auto normal-case tracking-normal"><CopyButton value={briefing.ideas} /></span>
              </summary>
              <p className="mt-2 text-xs text-zinc-500">{t('brief.subtitle')}</p>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {briefing.ideas}
              </div>
              <Link to="/dashboard/workspace" className="mt-3 inline-block text-xs font-medium text-brand-600 underline-offset-2 hover:underline">
                {t('brief.viewWorkspace')} â†’
              </Link>
            </details>
          )}
          <Outlet context={{ user, credits, refreshCredits }} />
        </main>
      </div>
    </div>
  )
}
