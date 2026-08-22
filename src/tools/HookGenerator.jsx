import { useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import { generate, getTool } from '../services/aiEngine.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

const TONES = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']

export default function HookGenerator() {
  const { refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('TikTok')
  const [tone, setTone] = useState(TONES[0])
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
      const text = await generate('hook', { topic, platform, tone })
      setResult(text)
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      await refreshCredits('hook')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('tools.hook')}</h2>
        <p className="mt-1 text-sm text-slate-400">{t('tools.hook.desc')}</p>
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
            placeholder={t('form.topic.placeholder.hook')}
            className="input"
          />
        </div>
        <div>
          <label className="label">{t('form.platform')}</label>
          <PlatformSelector value={platform} onChange={setPlatform} />
        </div>
        <CustomSelect
          label={t('form.tone')}
          options={TONES.map((v) => t(`tone.${v}`))}
          value={t(`tone.${tone}`)}
          onChange={(label) => {
            const found = TONES.find((v) => t(`tone.${v}`) === label)
            if (found) setTone(found)
          }}
        />
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          {t('btn.generateHooks')}
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
