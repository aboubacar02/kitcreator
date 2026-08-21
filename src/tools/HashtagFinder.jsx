import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Sparkles, Zap } from 'lucide-react'
import ResultCard from '../components/ResultCard.jsx'
import { generate, getTool } from '../services/aiEngine.js'

const platforms = ['TikTok', 'Instagram Reels', 'YouTube Shorts']

export default function HashtagFinder() {
  const { consume } = useOutletContext()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState(platforms[0])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      await consume(getTool('hashtag').credits)
      const text = await generate('hashtag', { niche, platform })
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
        <h2 className="text-2xl font-bold text-white">Smart Hashtag Finder</h2>
        <p className="mt-1 text-sm text-slate-400">
          A balanced mix of broad, medium and niche hashtags to maximize your
          reach.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="niche" className="label">
            Niche or keyword
          </label>
          <input
            id="niche"
            required
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Home workouts, Dropshipping, Personal finance..."
            className="input"
          />
        </div>
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
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !niche.trim()}
          className="btn-primary w-full !py-3.5 !text-base"
        >
          {loading ? (
            <Zap className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
          {loading ? 'Generating...' : 'Find Hashtags'}
        </button>
      </form>

      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
