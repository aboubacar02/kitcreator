import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, signUp, signInWithGoogle, isSupabaseConfigured } from '../services/supabase.js'

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
    <div className="flex min-h-screen items-center justify-center px-4">
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

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">or</span>
            <span className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            onClick={() => signInWithGoogle().catch((err) => setError(err.message))}
            disabled={!isSupabaseConfigured}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

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
