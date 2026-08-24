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
      <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-2 border-b border-zinc-200 bg-white px-3 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={t('nav.menu')}
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              K
            </div>
            <h1 className="text-base font-semibold tracking-tight text-zinc-950">
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-800"
          >
            <Zap className="h-3.5 w-3.5 text-zinc-500" />
            {isSupabaseConfigured
              ? t('nav.credits', { n: credits })
              : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })}
          </span>

          <button
            onClick={() => setShowPricing(true)}
            aria-label={t('nav.upgrade')}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <span className="flex items-center gap-2"><Crown className="h-4 w-4" />
            <span className="hidden lg:inline">{t('nav.upgrade')}</span></span>
          </button>

          <button
            onClick={onSignOut}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg p-2 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-950"
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
