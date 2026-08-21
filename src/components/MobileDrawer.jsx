import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Crown, LogOut, Settings, User, X, Zap } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'
import { TOOL_ICONS } from './toolIcons.js'
import { isSupabaseConfigured } from '../services/supabase.js'
import { DAILY_LIMIT } from '../services/credits.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function MobileDrawer({ open, onClose, credits, onSignOut, onUpgrade }) {
  const { t } = useI18n()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[85%] max-w-xs flex-col overflow-y-auto border-r border-slate-800 bg-[#0d1320] p-5 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-brand-600 px-2.5 py-1 text-lg font-black text-white">
                  KC
                </div>
                <span className="text-lg font-bold tracking-wide text-white">
                  KitCreator
                </span>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={t('nav.menu')}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t('drawer.navigate')}
            </p>
            <nav className="flex flex-col gap-1.5">
              {TOOLS.map((tool) => {
                const Icon = TOOL_ICONS[tool.id]
                return (
                  <NavLink
                    key={tool.id}
                    to={`/dashboard/${tool.id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? 'bg-brand-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(`tools.${tool.id}`)}
                  </NavLink>
                )
              })}
              <NavLink
                to="/dashboard/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                  }`
                }
              >
                <Settings className="h-4 w-4 shrink-0" />
                {t('sidebar.settings')}
              </NavLink>
            </nav>

            <div className="mt-auto space-y-3 border-t border-slate-800 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Zap className="h-3.5 w-3.5 text-brand-400" />
                {isSupabaseConfigured
                  ? t('nav.credits', { n: credits })
                  : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })}
              </span>

              <button
                onClick={() => {
                  onClose()
                  onUpgrade()
                }}
                className="btn-primary w-full !py-2.5 !text-sm"
              >
                <Crown className="h-4 w-4" />
                {t('settings.upgrade')}
              </button>

              <button
                onClick={() => {
                  onClose()
                  onSignOut()
                }}
                className="btn-ghost w-full !py-2.5 !text-sm !text-red-300 hover:!border-red-500/50 hover:!text-red-200"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>

              <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                <User className="h-3.5 w-3.5" />
                KitCreator
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
