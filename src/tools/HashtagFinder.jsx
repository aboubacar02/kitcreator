import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Loader2, Check, Hash, CircleAlert, RotateCcw } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate, getTool } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

export default function HashtagFinder() {
  const { refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [keywords, setKeywords] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const stateRef = useRef(null)

  async function runGeneration() {
    if (loading) return
    setError('')
    setResult('')
    setLoading(true)
    requestAnimationFrame(() => {
      stateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
    try {
      const text = await generate('hashtag', { niche, platform, keywords })
      setResult(text)
      await refreshCredits('hashtag')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    runGeneration()
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{t('tools.hashtag')}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t('tools.hashtag.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} data-background-lock className="card">
        <fieldset disabled={loading} className="space-y-4 border-0 p-0 m-0">
        <div>
          <label htmlFor="niche" className="label">
            {t('form.niche.label')}
          </label>
          <input
            id="niche"
            required
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder={t('form.niche.placeholder')}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="keywords" className="label">{t('form.keywords')} <span className="normal-case tracking-normal text-zinc-400">({t('form.optional')})</span></label>
          <input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t('form.keywords.placeholder')} className="input" />
          <p className="mt-2 text-xs text-zinc-400">SÃ©pare les idÃ©es par des virgules pour obtenir des hashtags plus prÃ©cis.</p>
        </div>
        <div>
          <label className="label">{t('form.platform')}</label>
          <PlatformSelector value={platform} onChange={setPlatform} />
        </div>
        <GenerateButton loading={loading} disabled={!niche.trim()}>
          {t('btn.findHashtags')}
        </GenerateButton>
        </fieldset>
      </form>

      <div ref={stateRef} className="scroll-mt-24 space-y-4">
        {loading && (
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('loading.hashtag')}
            </p>
            <LoadingSkeleton />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-50 px-4 py-4" role="alert">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800">{t('errors.title')}</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                type="button"
                onClick={runGeneration}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RotateCcw className="h-4 w-4" />
                {t('errors.retry')}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !result && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 px-6 py-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
              <Hash className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-zinc-950">{t('empty.title')}</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{t('empty.hint')}</p>
          </div>
        )}

        {!loading && !error && result && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              {t('success.label')}
            </div>
            <ResultCard title={t('result.hashtag')} content={result} />
          </div>
        )}
      </div>
    </div>
  )
}
