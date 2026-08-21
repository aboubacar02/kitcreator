import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, signUp, isSupabaseConfigured } from '../services/supabase.js'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        const data = await signUp(email, password)
        if (data?.session) {
          navigate('/dashboard')
        } else {
          setInfo(
            'Account created! Check your inbox and confirm your email before logging in.',
          )
          setMode('login')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="rounded-xl bg-brand-600 px-3 py-1.5 text-xl font-black text-white">
            KC
          </div>
          <span className="text-2xl font-bold tracking-wide text-white">
            KitCreator
          </span>
        </Link>

        <div className="card">
          <h1 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Log in' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login'
              ? 'Welcome back.'
              : '5 free daily credits to get started.'}
          </p>

          {!isSupabaseConfigured && (
            <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Supabase is not configured yet. Set VITE_SUPABASE_URL and
              VITE_SUPABASE_ANON_KEY in your .env file.
            </p>
          )}

          {info && (
            <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {info}
            </p>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="btn-primary w-full !py-3"
            >
              {loading
                ? 'Loading...'
                : mode === 'login'
                  ? 'Log in'
                  : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {mode === 'login' ? (
              <>
                No account yet?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-semibold text-brand-400 hover:text-brand-300"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-semibold text-brand-400 hover:text-brand-300"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
