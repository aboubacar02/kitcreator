import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'
import SocialProof from '../components/SocialProof.jsx'

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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
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

      <main className="space-y-8">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-brand-600/20 blur-[120px]" />
          <div className="pointer-events-none absolute left-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-blue-600/15 blur-[100px]" />
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32"
          >
            <motion.h1
              variants={item}
              className="text-gradient mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl"
            >
              Create viral content
              <br />
              in seconds
            </motion.h1>
            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-2xl text-lg text-slate-400"
            >
              Hooks, scripts, hashtags, titles: the complete AI toolkit for
              TikTok, Reels and YouTube Shorts creators. Less time writing, more
              time creating.
            </motion.p>
            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                to="/auth"
                className="btn-primary btn-shimmer !px-8 !py-3 !text-base"
              >
                Try it for free
              </Link>
              <a href="#tools" className="btn-ghost !px-8 !py-3 !text-base">
                Explore the tools
              </a>
            </motion.div>
            <motion.p variants={item} className="mt-4 text-xs text-slate-500">
              No credit card required · 5 free daily credits included
            </motion.p>
            <motion.div variants={item} className="mt-10">
              <SocialProof />
            </motion.div>
          </motion.div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="text-gradient text-center text-3xl font-bold sm:text-4xl">
            4 tools, one goal: performance
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {TOOLS.map((tool) => (
              <motion.div
                key={tool.id}
                variants={item}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="card transition-colors duration-300 hover:border-brand-500/50 hover:shadow-brand-600/20"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-600/20 text-brand-300 backdrop-blur-sm">
                  <span className="text-lg font-black">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {tool.description}
                </p>
                <p className="mt-4 text-xs font-semibold text-brand-400">
                  {tool.credits} credit{tool.credits > 1 ? 's' : ''} per run
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-slate-800/60 bg-surface/40 py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-gradient text-center text-3xl font-bold sm:text-4xl">
              Why KitCreator?
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-14 grid gap-10 sm:grid-cols-2"
            >
              {features.map((feature) => (
                <motion.div key={feature.title} variants={item}>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-400" />
                    {feature.title}
                  </h3>
                  <p className="mt-2 pl-7 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-28 text-center sm:px-6">
          <h2 className="text-gradient text-3xl font-bold sm:text-4xl">
            Ready to level up?
          </h2>
          <p className="mt-4 text-slate-400">
            Join creators who publish more without spending hours on their copy.
          </p>
          <Link to="/auth" className="btn-primary btn-shimmer mt-10 !px-10 !py-3 !text-base">
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
