import { useState } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Crown, Languages, LogOut, User, Zap } from 'lucide-react'
import PricingModal from '../components/PricingModal.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import { signOut } from '../services/supabase.js'
import {
  LANGUAGES,
  getLanguagePreference,
  setLanguagePreference,
} from '../services/language.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-500/30 bg-brand-600/15 text-brand-300">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-white">
        {children}
      </h3>
    </div>
  )
}

export default function Settings() {
  const { user, credits } = useOutletContext()
  const { t, setLanguage } = useI18n()
  const navigate = useNavigate()
  const initial = (user?.email || '?').charAt(0).toUpperCase()
  const [langPref, setLangPref] = useState(getLanguagePreference())
  const [showPricing, setShowPricing] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('settings.title')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('settings.subtitle')}</p>
      </div>

      {/* Compte */}
      <section className="space-y-4">
        <SectionTitle icon={User}>{t('settings.section.account')}</SectionTitle>
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-500/50 bg-brand-600/25 text-lg font-bold text-brand-300">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.email}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t('settings.activeSession')}
            </p>
          </div>
        </div>
      </section>

      {/* Préférences */}
      <section className="space-y-4">
        <SectionTitle icon={Languages}>
          {t('settings.section.preferences')}
        </SectionTitle>
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-slate-200">
            {t('settings.language')}
          </p>
          <p className="text-xs leading-relaxed text-slate-500">
            {t('settings.languageHint')}
          </p>
          <div className="max-w-xs pt-1">
            <CustomSelect
              options={LANGUAGES.map((l) => l.label)}
              value={LANGUAGES.find((l) => l.value === langPref)?.label}
              onChange={(label) => {
                const found = LANGUAGES.find((l) => l.label === label)
                if (found) {
                  setLangPref(found.value)
                  setLanguagePreference(found.value)
                  setLanguage(found.value)
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Abonnement */}
      <section className="space-y-4">
        <SectionTitle icon={Crown}>
          {t('settings.section.subscription')}
        </SectionTitle>
        <div className="card flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-600/15 text-brand-300">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-tight text-white">
                {credits}
                <span className="ml-2 align-middle text-sm font-medium text-slate-400">
                  {t('settings.credits')} · {t('settings.freePlan').split(' — ')[0]}
                </span>
              </p>
              <p className="text-xs text-slate-500">{t('settings.upgradeHint')}</p>
            </div>
          </div>
          <button
            onClick={() => setShowPricing(true)}
            className="btn-primary shrink-0 !px-5 !py-2.5 !text-sm"
          >
            <Crown className="h-4 w-4" />
            {t('settings.upgrade')}
          </button>
        </div>
      </section>

      {/* Danger */}
      <section className="space-y-4">
        <SectionTitle icon={LogOut}>{t('settings.section.danger')}</SectionTitle>
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-red-500/40 bg-red-500/5 px-5 py-3.5 text-left transition hover:border-red-500 hover:bg-red-500/10 sm:w-auto"
        >
          <span className="flex items-center gap-2.5 text-sm font-semibold text-red-300">
            <LogOut className="h-4 w-4" />
            {t('settings.logout')}
          </span>
          <span className="mt-0.5 block pl-[26px] text-xs text-slate-500">
            {t('settings.logoutHint')}
          </span>
        </button>
      </section>

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
    </div>
  )
}
