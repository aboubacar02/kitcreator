import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ResultCard from '../components/ResultCard.jsx'
import GenerateButton from '../components/GenerateButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import { generate, getTool } from '../services/aiEngine.js'

export default function TitleAnalyzer() {
  const { consume } = useOutletContext()
  const [title, setTitle] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      await consume(getTool('title').credits)
      const text = await generate('title', { title })
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
        <h2 className="text-2xl font-bold text-white">Title Analyzer</h2>
        <p className="mt-1 text-sm text-slate-400">
          Score your titles and get more clickable variants in one click.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label htmlFor="title" className="label">
            Your video title
          </label>
          <textarea
            id="title"
            required
            rows={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Paste the title you want to analyze..."
            className="input resize-none"
          />
        </div>
        {error && (
          <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <GenerateButton loading={loading} disabled={!title.trim()}>
          Analyze Title
        </GenerateButton>
      </form>

      {loading && <LoadingSkeleton />}
      {result && <ResultCard title="Generated Results:" content={result} />}
    </div>
  )
}
