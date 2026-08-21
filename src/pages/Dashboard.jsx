import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import {
  getSession,
  ensureProfile,
  getProfile,
  signOut,
  onAuthStateChange,
  consumeCredits,
  isSupabaseConfigured,
} from '../services/supabase.js'
import {
  getLocalCredits,
  consumeLocalCredits,
} from '../services/credits.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function Dashboard() {
  const { t } = useI18n()
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [localCredits, setLocalCredits] = useState(getLocalCredits())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    let mounted = true

    async function init() {
      const currentSession = await getSession()
      if (!mounted) return
      setSession(currentSession)
      if (currentSession?.user) {
        const userProfile = await ensureProfile(currentSession.user)
        if (mounted) setProfile(userProfile)
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

  async function consume(amount) {
    if (isSupabaseConfigured && session?.user?.id) {
      await consumeCredits(session.user.id, amount)
      const updated = await getProfile(session.user.id)
      if (updated) setProfile(updated)
    } else {
      setLocalCredits(consumeLocalCredits(amount))
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
      </div>
    )
  }

  if (isSupabaseConfigured && !session) {
    return <Navigate to="/auth" replace />
  }

  const user = session?.user ?? { id: 'demo', email: 'demo@kitcreator.app' }
  const credits = isSupabaseConfigured ? (profile?.credits ?? 0) : localCredits

  return (
    <div className="flex min-h-screen flex-col text-slate-100">
      <Navbar credits={credits} onSignOut={handleSignOut} />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar user={user} />
        <main className="mx-auto w-full max-w-4xl flex-1 p-6 md:p-12">
          {!isSupabaseConfigured && (
            <p className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {t('demo.notice')}
            </p>
          )}
          {isSupabaseConfigured && !profile && (
            <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {t('setup.profileMissing')}
            </p>
          )}
          <Outlet context={{ user, credits, consume }} />
        </main>
      </div>
    </div>
  )
}
