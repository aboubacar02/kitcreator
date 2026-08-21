import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate, getTool } from '../services/aiEngine.js'

export default function HashtagFinder() {
  const { consume } = useOutletContext()
  const [niche, setNiche] = useState('')
  const [platform, setPlatform] = useState('TikTok')
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
          <label className="label">Platform</label>
          <PlatformSelector
            value={platform}
            onChange={setPlatform}
          />
        </div>
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!niche.trim()}>
          Find Hashtags
        </GenerateButton>
      </form>

      {loading && <LoadingSkeleton />}
      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
