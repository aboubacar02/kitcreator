import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { User, LogOut, Zap, CreditCard, Languages } from 'lucide-react'
import { signOut } from '../services/supabase.js'
import CustomSelect from '../components/CustomSelect.jsx'
import {
  LANGUAGES,
  getLanguagePreference,
  setLanguagePreference,
} from '../services/language.js'
import { t } from '../i18n/strings.js'

export default function Settings() {
  const { user, credits } = useOutletContext()
  const navigate = useNavigate()
  const initial = (user?.email || '?').charAt(0).toUpperCase()
  const [langPref, setLangPref] = useState(getLanguagePreference())

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('settings.subtitle')}</p>
      </div>

      <div className="card flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-500/50 bg-brand-600/30 text-xl font-bold text-brand-300">
          {initial}
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-lg font-semibold text-white">
            {user?.email}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {t('settings.activeSession')}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <Zap className="h-4 w-4 text-brand-400" />
            {t('settings.credits')}
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{credits}</p>
          <p className="mt-1 text-xs text-slate-500">{t('settings.freePlan')}</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <CreditCard className="h-4 w-4 text-brand-400" />
            {t('settings.plan')}
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{t('settings.free')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('settings.upgradeHint')}</p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
          <Languages className="h-4 w-4 text-brand-400" />
          {t('settings.language')}
        </div>
        <p className="mt-1 text-xs text-slate-500">{t('settings.languageHint')}</p>
        <div className="mt-4 max-w-xs">
          <CustomSelect
            options={LANGUAGES.map((l) => l.label)}
            value={LANGUAGES.find((l) => l.value === langPref)?.label}
            onChange={(label) => {
              const found = LANGUAGES.find((l) => l.label === label)
              if (found) {
                setLangPref(found.value)
                setLanguagePreference(found.value)
                window.location.reload()
              }
            }}
          />
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="btn-ghost !border-red-500/40 !text-red-300 hover:!border-red-500 hover:!text-red-200"
      >
        <LogOut className="h-4 w-4" />
        {t('settings.logout')}
      </button>
    </div>
  )
}
