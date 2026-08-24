import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import { generate, getTool } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

const DURATIONS = ['15', '30', '60']
const STYLES = ['Educational', 'Storytelling', 'Funny', 'Persuasive']

export default function ScriptWriter() {
  const { refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(DURATIONS[1])
  const [style, setStyle] = useState(STYLES[0])
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
      const text = await generate('script', { topic, duration, style, audience, objective })
      setResult(text)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      await refreshCredits('script')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{t('tools.script')}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t('tools.script.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} data-background-lock className="card space-y-4">
        <div>
          <label htmlFor="topic" className="label">
            {t('form.topic.label')}
          </label>
          <input
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('form.topic.placeholder.script')}
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CustomSelect
            label={t('form.duration')}
            options={DURATIONS.map((d) => `${d}s`)}
            value={`${duration}s`}
            onChange={(v) => setDuration(v.replace('s', ''))}
          />
          <CustomSelect
            label={t('form.style')}
            options={STYLES.map((v) => t(`style.${v}`))}
            value={t(`style.${style}`)}
            onChange={(label) => {
              const found = STYLES.find((v) => t(`style.${v}`) === label)
              if (found) setStyle(found)
            }}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="audience" className="label">{t('form.audience')} <span className="normal-case tracking-normal text-zinc-400">({t('form.optional')})</span></label>
            <input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder={t('form.audience.placeholder')} className="input" />
          </div>
          <div>
            <label htmlFor="objective" className="label">{t('form.objective')} <span className="normal-case tracking-normal text-zinc-400">({t('form.optional')})</span></label>
            <input id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder={t('form.objective.placeholder')} className="input" />
          </div>
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          {t('btn.generateScript')}
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
