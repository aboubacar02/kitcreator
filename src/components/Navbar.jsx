import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Crown, LogOut, Zap } from 'lucide-react'
import PricingModal from './PricingModal.jsx'
import { isSupabaseConfigured } from '../services/supabase.js'
import { DAILY_LIMIT } from '../services/credits.js'
import { t } from '../i18n/strings.js'

export default function Navbar({ credits, onSignOut }) {
  const [showPricing, setShowPricing] = useState(false)

  return (
    <>
      <header className="flex h-16 items-center justify-between gap-2 border-b border-slate-800 bg-ink px-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <div className="rounded-xl bg-brand-600 px-2.5 py-1 text-lg font-black text-white">
            KC
          </div>
          <h1 className="text-lg font-bold tracking-wide text-white">
            KitCreator
          </h1>
        </Link>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span
            title={
              isSupabaseConfigured
                ? t('nav.credits', { n: credits })
                : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-800 bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-300 sm:px-3"
          >
            <Zap className="h-3.5 w-3.5 text-brand-400" />
            <span className="hidden sm:inline">
              {isSupabaseConfigured
                ? t('nav.credits', { n: credits })
                : t('nav.freeCredits', { n: credits, total: DAILY_LIMIT })}
            </span>
            <span className="sm:hidden">{credits}</span>
          </span>

          <button
            onClick={() => setShowPricing(true)}
            aria-label={t('nav.upgrade')}
            className="btn-primary !px-2.5 !py-1.5 !text-xs sm:!px-3"
          >
            <Crown className="h-4 w-4 sm:hidden" />
            <span className="hidden sm:inline">{t('nav.upgrade')}</span>
          </button>

          <button
            onClick={onSignOut}
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
            className="flex shrink-0 items-center gap-1.5 rounded-lg p-2 text-xs font-medium text-slate-400 transition hover:text-white"
          >
            <LogOut className="h-4 w-4 md:hidden" />
            <span className="hidden md:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </header>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  )
}
