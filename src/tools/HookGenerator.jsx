import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Sparkles, Zap } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
import { generate, getTool } from '../services/aiEngine.js'

const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts']
const tones = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']

export default function HookGenerator() {
  const { consume } = useOutletContext()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState(platforms[0])
  const [tone, setTone] = useState(tones[0])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      await consume(getTool('hook').credits)
      const text = await generate('hook', { topic, platform, tone })
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
        <h2 className="text-2xl font-bold text-white">Viral Hook Generator</h2>
        <p className="mt-1 text-sm text-slate-400">
          Scroll-stopping hooks optimized for US & EU TikTok, Instagram Reels,
          and YouTube Shorts.
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
            placeholder="e.g. Fitness tips, E-commerce, AI tools..."
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="platform" className="label">
              Platform
            </label>
            <select
              id="platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="input"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="label">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="input"
            >
              {tones.map((t) => (
                <option key={t} value={t}>
                  {t}
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
          {loading ? 'Generating...' : 'Generate Hooks'}
        </button>
      </form>

      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
