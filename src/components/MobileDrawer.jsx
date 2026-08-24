import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Crown, FolderKanban, LogOut, Settings, User, X, Zap } from 'lucide-react'
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
            className="fixed inset-0 z-40 bg-zinc-900/40 md:hidden"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[85%] max-w-xs flex-col overflow-y-auto border-r border-zinc-200 bg-white p-5 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu')}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-zinc-900 px-2.5 py-1 text-base font-bold text-white">
                  K
                </div>
                <span className="text-base font-semibold tracking-tight text-zinc-950">
                  KitCreator
                </span>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={t('nav.menu')}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 px-2 text-xs font-medium text-zinc-400">
              {t('drawer.navigate')}
            </p>
            <nav className="flex flex-col gap-1">
              {TOOLS.map((tool) => {
                const Icon = TOOL_ICONS[tool.id]
                return (
                  <NavLink
                    key={tool.id}
                    to={`/dashboard/${tool.id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-zinc-100 font-medium text-zinc-950'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(`tools.${tool.id}`)}
                  </NavLink>
                )
              })}
              <NavLink
                to="/dashboard/kitbot"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-100 font-medium text-zinc-950'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                  }`
                }
              >
                <Bot className="h-4 w-4 shrink-0" />
                KitBot
              </NavLink>
              <NavLink
                to="/dashboard/workspace"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-100 font-medium text-zinc-950'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                  }`
                }
              >
                <FolderKanban className="h-4 w-4 shrink-0" />
                {t('ws.title')}
              </NavLink>
              <NavLink
                to="/dashboard/settings"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-zinc-100 font-medium text-zinc-950'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
                  }`
                }
              >
                <Settings className="h-4 w-4 shrink-0" />
                {t('sidebar.settings')}
              </NavLink>
            </nav>

            <div className="mt-auto space-y-3 border-t border-zinc-200 pt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800">
                <Zap className="h-3.5 w-3.5 text-zinc-500" />
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
                className="btn-ghost w-full !py-2.5 !text-sm !text-red-600 hover:!border-red-200 hover:!bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>

              <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
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
