import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, LogOut, Menu, Zap } from 'lucide-react'
import PricingModal from './PricingModal.jsx'
import MobileDrawer from './MobileDrawer.jsx'
import { isSupabaseConfigured } from '../services/supabase.js'
import { DAILY_LIMIT } from '../services/credits.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function Navbar({ credits, onSignOut }) {
  const { t } = useI18n()
  const [showPricing, setShowPricing] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-2 border-b border-white/[0.08] bg-ink/80 px-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={t('nav.menu')}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-sm font-black text-white shadow-lg shadow-brand-500/25">
              K
            </div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              KitCreator
            </h1>
          </Link>
        </div>

        <div className="hidden min-w-0 items-center gap-2 sm:flex sm:gap-3">
          <span
            title={
              isSupabaseConfigured
                ? t('nav.credits', { n: credits })
                : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-bold text-brand-200"
          >
            <Zap className="h-3.5 w-3.5 text-brand-400" />
            {isSupabaseConfigured
              ? t('nav.credits', { n: credits })
              : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })}
          </span>

          <button
            onClick={() => setShowPricing(true)}
            aria-label={t('nav.upgrade')}
            className="btn-primary !px-3 !py-1.5 !text-xs"
          >
            <Crown className="h-4 w-4" />
            <span className="hidden lg:inline">{t('nav.upgrade')}</span>
          </button>

          <button
            onClick={onSignOut}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg p-2 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xl:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        credits={credits}
        onSignOut={onSignOut}
        onUpgrade={() => setShowPricing(true)}
      />

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  )
}
