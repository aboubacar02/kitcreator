import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import PricingModal from './PricingModal.jsx'
import { isSupabaseConfigured } from '../services/supabase.js'
import { DAILY_LIMIT } from '../services/credits.js'

export default function Navbar({ credits, onSignOut }) {
  const [showPricing, setShowPricing] = useState(false)

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-ink px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 px-2.5 py-1 text-lg font-black text-white">
            KC
          </div>
          <h1 className="text-lg font-bold tracking-wide text-white">
            KitCreator
          </h1>
        </Link>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-300">
            <Zap className="h-3.5 w-3.5 text-brand-400" />
            {isSupabaseConfigured
              ? `${credits} credits`
              : `${credits}/${DAILY_LIMIT} free daily credits`}
          </span>
          <button
            onClick={() => setShowPricing(true)}
            className="btn-primary !px-3 !py-1.5 !text-xs"
          >
            Upgrade to PRO ($9.99)
          </button>
          <button
            onClick={onSignOut}
            className="text-xs font-medium text-slate-400 transition hover:text-white"
          >
            Log out
          </button>
        </div>
      </header>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </>
  )
}
