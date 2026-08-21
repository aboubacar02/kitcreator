import { Link } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'

const features = [
  {
    title: 'Hooks that stop the scroll',
    description:
      'Generate hooks proven on millions of views, tailored to your platform and tone.',
  },
  {
    title: 'Ready-to-shoot scripts',
    description:
      'Complete structures with timecodes: hook, body, climax and call-to-action.',
  },
  {
    title: 'Smart hashtags',
    description:
      'A balanced mix of broad, medium and niche hashtags to maximize your reach.',
  },
  {
    title: 'Optimized titles',
    description:
      'Analyze your titles, get a click-potential score and stronger variants.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-brand-600 px-2.5 py-1 text-lg font-black text-white">
            KC
          </div>
          <span className="text-lg font-bold tracking-wide text-white">
            KitCreator
          </span>
        </div>
        <Link to="/auth" className="btn-primary">
          Start for free
        </Link>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
          <span className="inline-flex rounded-full border border-brand-500/40 bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-300">
            AI-powered — Built for creators
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Create viral content
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-fuchsia-400 bg-clip-text text-transparent">
              in seconds
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            Hooks, scripts, hashtags, titles: the complete AI toolkit for TikTok,
            Reels and YouTube Shorts creators. Less time writing, more time
            creating.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/auth" className="btn-primary !px-8 !py-3 !text-base">
              Try it for free
            </Link>
            <a href="#tools" className="btn-ghost !px-8 !py-3 !text-base">
              Explore the tools
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            No credit card required · 5 free daily credits included
          </p>
        </section>

        <section id="tools" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-white">
            4 tools, one goal: performance
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className="card transition hover:border-brand-500/50"
              >
                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tool.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-brand-400">
                  {tool.credits} credit{tool.credits > 1 ? 's' : ''} per run
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-800 bg-surface/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold text-white">
              Why KitCreator?
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.title}>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-400" />
                    {feature.title}
                  </h3>
                  <p className="mt-2 pl-7 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to level up?
          </h2>
          <p className="mt-4 text-slate-400">
            Join creators who publish more without spending hours on their copy.
          </p>
          <Link to="/auth" className="btn-primary mt-8 !px-10 !py-3 !text-base">
            Create my free account
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} KitCreator — All rights reserved.
      </footer>
    </div>
  )
}
