import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Sparkles, Zap } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
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
          <div>
            <label htmlFor="duration" className="label">
              Duration (seconds)
            </label>
            <select
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="input"
            >
              {durations.map((d) => (
                <option key={d} value={d}>
                  {d}s
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="style" className="label">
              Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input"
            >
              {styles.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="btn-primary w-full !py-3.5 !text-base"
        >
          {loading ? (
            <Zap className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          {loading ? 'Generating...' : 'Generate Script'}
        </button>
      </form>

      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
