import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Package } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

export default function PackGenerator() {
  const { refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [audience, setAudience] = useState('')
  const [objective, setObjective] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const resultRef = useRef(null)
  const loadingRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')
    setResult('')
    setLoading(true)
    requestAnimationFrame(() => {
      loadingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    try {
      const text = await generate('pack', { topic, platform, audience, objective })
      setResult(text)
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
      <div ref={resultRef} className="scroll-mt-24">
        {result && !loading && (
          <ResultCard title={t('tools.pack')} content={result} />
        )}
      </div>
    </div>
  )
}
