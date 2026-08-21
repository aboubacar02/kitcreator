import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate, getTool } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

export default function HashtagFinder() {
  const { consume } = useOutletContext()
  const { t } = useI18n()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const resultRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setError('')
    setResult('')
    setLoading(true)
    try {
      await consume(getTool('hashtag').credits)
      const text = await generate('hashtag', { niche, platform })
      setResult(text)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('tools.hashtag')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('tools.hashtag.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
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
          <label className="label">{t('form.platform')}</label>
          <PlatformSelector value={platform} onChange={setPlatform} />
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!niche.trim()}>
          {t('btn.findHashtags')}
        </GenerateButton>
      </form>

      {loading && <LoadingSkeleton />}
      <div ref={resultRef} className="scroll-mt-24">
        {result && !loading && (
          <ResultCard title={t('result.title')} content={result} />
        )}
      </div>
    </div>
  )
}
