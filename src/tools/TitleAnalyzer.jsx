import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import { generate, getTool } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

export default function TitleAnalyzer() {
  const { refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [title, setTitle] = useState('')
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
      const text = await generate('title', { title })
      setResult(text)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      await refreshCredits('title')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">{t('tools.title')}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t('tools.title.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} data-background-lock className="card space-y-4">
        <div>
          <label htmlFor="video-title" className="label">
            {t('form.yourTitle.label')}
          </label>
          <textarea
            id="video-title"
            required
            rows={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('form.yourTitle.placeholder')}
            className="input resize-none"
          />
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!title.trim()}>
          {t('btn.analyzeTitle')}
        </GenerateButton>
      </form>

      <div ref={loadingRef} className="scroll-mt-24">
        {loading && <LoadingSkeleton />}
      </div>
      <div ref={resultRef} className="scroll-mt-24">
        {result && !loading && (
          <ResultCard title={t('result.title')} content={result} />
        )}
      </div>
    </div>
  )
}
