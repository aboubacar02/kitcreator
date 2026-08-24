import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Copy, Loader2, Package, Save } from 'lucide-react'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate } from '../services/aiEngine.js'
import { supabase, isSupabaseConfigured } from '../services/supabase.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

function CopyButton({ value }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          /* clipboard indisponible */
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('result.copied') : t('result.copy')}
    </button>
  )
}

function SectionTitle({ icon, children, action }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
        <span aria-hidden>{icon}</span>
        {children}
      </h4>
      {action}
    </div>
  )
}

export default function PackGenerator() {
  const { user, refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [audience, setAudience] = useState('')
  const [objective, setObjective] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('idle')
  const resultRef = useRef(null)
  const loadingRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')
    setResult(null)
    setLoading(true)
    requestAnimationFrame(() => {
      loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    try {
      const pack = await generate('pack', { topic, platform, audience, objective })
      setResult(pack)
      setSaveState('idle')
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      await refreshCredits('pack')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!result || !isSupabaseConfigured || !supabase || !user) return
    setSaveState('saving')
    const { error: saveError } = await supabase.from('saved_projects').insert({
      user_id: user.id,
      title: topic.trim().slice(0, 120),
      type: 'pack',
      content: result,
    })
    setSaveState(saveError ? 'error' : 'done')
  }

  const hashtagsLine = result ? result.hashtags.join(' ') : ''

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200">
            <Package className="h-3.5 w-3.5" /> All-in-one
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">{t('tools.pack')}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">{t('tools.pack.desc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} data-background-lock className="card space-y-5">
        <div>
          <label htmlFor="topic" className="label">
            {t('form.topic.label')}
          </label>
          <input
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('form.topic.placeholder.pack')}
            className="input"
          />
        </div>
        <div>
          <label className="label">{t('form.platform')}</label>
          <PlatformSelector value={platform} onChange={setPlatform} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="audience" className="label">
              {t('form.audience')} <span className="normal-case tracking-normal text-slate-500">({t('form.optional')})</span>
            </label>
            <input
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder={t('form.audience.placeholder')}
              className="input"
              maxLength={160}
            />
          </div>
          <div>
            <label htmlFor="objective" className="label">
              {t('form.objective')} <span className="normal-case tracking-normal text-slate-500">({t('form.optional')})</span>
            </label>
            <input
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder={t('form.objective.placeholder')}
              className="input"
              maxLength={160}
            />
          </div>
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          {t('btn.generatePack')}
        </GenerateButton>
      </form>

      <div ref={loadingRef} className="scroll-mt-24">
        {loading && <LoadingSkeleton />}
      </div>

      {result && !loading && (
        <div ref={resultRef} data-background-lock className="card scroll-mt-24 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <h3 className="text-lg font-bold text-white">{t('tools.pack')}</h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isSupabaseConfigured || !user || saveState === 'saving' || saveState === 'done'}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-sm font-semibold text-brand-200 transition hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saveState === 'saving' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveState === 'done' ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveState === 'done' ? t('pack.saved') : t('btn.savePack')}
            </button>
          </div>

          <section>
            <SectionTitle icon="🎣">{t('pack.hooks')}</SectionTitle>
            <ul className="space-y-2">
              {result.hooks.map((hook, i) => (
                <li key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <p className="font-medium leading-snug text-white">
                    <span className="mr-2 text-brand-300">{i + 1}.</span>
                    {hook.text}
                  </p>
                  {hook.visual && (
                    <p className="mt-1.5 text-xs text-brand-200/80">🎬 {hook.visual}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle
              icon="🎬"
              action={<CopyButton value={`${result.script.intro}\n\n${result.script.body}\n\n${result.script.cta}`} />}
            >
              {t('pack.script')}
            </SectionTitle>
            <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="leading-relaxed text-slate-200">
                <span className="font-semibold text-slate-400">[0-5s]</span> {result.script.intro}
              </p>
              <p className="leading-relaxed text-slate-200">
                <span className="font-semibold text-slate-400">[5-45s]</span> {result.script.body}
              </p>
              {result.script.broll_ideas.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {result.script.broll_ideas.map((idea, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-slate-300"
                    >
                      🎥 {idea}
                    </span>
                  ))}
                </div>
              )}
              <p className="leading-relaxed text-slate-200">
                <span className="font-semibold text-slate-400">[45-60s]</span> {result.script.cta}
              </p>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section>
              <SectionTitle icon="📌" action={<CopyButton value={result.seo_title} />}>
                {t('pack.seoTitle')}
              </SectionTitle>
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 leading-relaxed text-white">
                {result.seo_title}
              </p>
            </section>
            <section>
              <SectionTitle icon="#️⃣" action={<CopyButton value={hashtagsLine} />}>
                {t('pack.hashtags')}
              </SectionTitle>
              <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-brand-200">
                {hashtagsLine}
              </p>
            </section>
          </div>

          {result.next_ideas.length > 0 && (
            <section>
              <SectionTitle icon="💡">{t('pack.nextIdeas')}</SectionTitle>
              <ol className="list-inside list-decimal space-y-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-slate-200">
                {result.next_ideas.map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ol>
            </section>
          )}

          {saveState === 'error' && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {t('errors.generic')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
