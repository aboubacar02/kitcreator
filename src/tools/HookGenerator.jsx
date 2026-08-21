import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import PlatformSelector from '../components/PlatformSelector.jsx'
import { generate, getTool } from '../services/aiEngine.js'

const tones = ['Energetic', 'Curious', 'Bold', 'Inspirational', 'Funny']

export default function HookGenerator() {
  const { consume } = useOutletContext()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('TikTok')
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
        <div>
          <label className="label">Platform</label>
          <PlatformSelector
            value={platform}
            onChange={setPlatform}
          />
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
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!topic.trim()}>
          Generate Hooks
        </GenerateButton>
      </form>

      {loading && <LoadingSkeleton />}
      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
