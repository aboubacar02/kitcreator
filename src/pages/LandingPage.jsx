import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'
import SocialProof from '../components/SocialProof.jsx'
import { useI18n } from '../i18n/LanguageContext.jsx'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const TOOL_INITIALS = { hook: 'H', script: 'S', hashtag: '#', title: 'T' }

export default function LandingPage() {
  const { t } = useI18n()

  const features = [
    { key: 'f1' },
    { key: 'f2' },
    { key: 'f3' },
    { key: 'f4' },
  ]

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-brand-600 px-2.5 py-1 text-sm font-bold text-white">
            K
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-950">
            KitCreator
          </span>
        </div>
        <Link to="/auth" className="btn-primary !px-4 !py-2 !text-sm sm:!px-5">
          {t('landing.ctaStart')}
        </Link>
      </header>

      <main className="space-y-8">
        <section className="relative overflow-hidden">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32"
          >
            <motion.h1
              variants={item}
              className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl"
            >
              {t('landing.heroTitle1')}
              <br />
              {t('landing.heroTitle2')}
            </motion.h1>
            <motion.p
              variants={item}
              className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600"
            >
              {t('landing.subtitle')}
            </motion.p>
            <motion.div
              variants={item}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                to="/auth"
                className="btn-primary w-full !px-8 !py-3 !text-base sm:w-auto"
              >
                {t('landing.ctaTry')}
              </Link>
              <a href="#tools" className="btn-ghost w-full !px-8 !py-3 !text-base sm:w-auto">
                {t('landing.ctaExplore')}
              </a>
            </motion.div>
            <motion.p variants={item} className="mt-4 text-xs text-zinc-600">
              {t('landing.note')}
            </motion.p>
            <motion.div variants={item} className="mt-10">
              <SocialProof />
            </motion.div>
          </motion.div>
        </section>

        <section id="tools" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {t('landing.toolsTitle')}
          </h2>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {TOOLS.map((tool) => (
              <motion.div
                key={tool.id}
                variants={item}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="card transition-colors duration-300 hover:border-zinc-300"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-600">
                  <span>
                    {TOOL_INITIALS[tool.id]}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-zinc-950">
                  {t(`tools.${tool.id}`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  {t(`tools.${tool.id}.desc`)}
                </p>
                <p className="mt-4 text-xs font-medium text-brand-600">
                  {t('landing.creditPerRun', {
                    n: tool.credits,
                    n_s: tool.credits > 1 ? 's' : '',
                  })}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="border-t border-zinc-100 bg-white py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              {t('landing.whyTitle')}
            </h2>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="mt-14 grid gap-10 sm:grid-cols-2"
            >
              {features.map(({ key }) => (
                <motion.div key={key} variants={item}>
                  <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-950">
                    <ArrowRight className="h-5 w-5 shrink-0 text-brand-600" />
                    {t(`landing.${key}.t`)}
                  </h3>
                  <p className="mt-2 pl-7 text-sm leading-relaxed text-zinc-500">
                    {t(`landing.${key}.d`)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-28 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            {t('landing.finalTitle')}
          </h2>
          <p className="mt-4 text-zinc-500">{t('landing.finalText')}</p>
          <Link to="/auth" className="btn-primary mt-10 !px-10 !py-3 !text-base">
            {t('landing.finalCta')}
          </Link>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-400">
        {t('landing.rights', { year: new Date().getFullYear() })}
      </footer>
    </div>
  )
}
