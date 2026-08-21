import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import CustomSelect from '../components/CustomSelect.jsx'
import { generate, getTool } from '../services/aiEngine.js'

const durations = ['15', '30', '60']
const styles = ['Educational', 'Storytelling', 'Funny', 'Persuasive']

export default function ScriptWriter() {
  const { consume } = useOutletContext()
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(durations[1])
  const [style, setStyle] = useState(styles[0])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      await consume(getTool('script').credits)
      const text = await generate('script', { topic, duration, style })
      setResult(text)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Short Video Script Writer</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ready-to-shoot scripts with timecodes: hook, body, climax and
          call-to-action.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="topic" className="label">
            Niche, topic, or keyword
          </label>
          <input
            id="topic"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. How I grew my shop to $10k/month..."
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CustomSelect
            label="Duration (seconds)"
            options={durations.map((d) => `${d}s`)}
            value={`${duration}s`}
            onChange={(v) => setDuration(v.replace('s', ''))}
          />
          <CustomSelect
            label="Style"
            options={styles}
            value={style}
            onChange={setStyle}
          />
        </div>
        {error && (
          <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          Generate Script
        </GenerateButton>
      </form>

      {loading && <LoadingSkeleton />}
      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
