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
  const { consume } = useOutletContext()
  const { t } = useI18n()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(DURATIONS[1])
  const [style, setStyle] = useState(STYLES[0])
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
      await consume(getTool('script').credits)
      const text = await generate('script', { topic, duration, style })
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
        <h2 className="text-2xl font-bold text-white">{t('tools.script')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('tools.script.desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
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
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          {t('btn.generateScript')}
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
