import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, WandSparkles } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext.jsx'

function ShimmerBlock({ className, delay = 0, reduceMotion }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-zinc-100/80 ${className}`}>
      {!reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
          }}
          initial={{ x: '-120%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
        />
      )}
    </div>
  )
}

export default function LoadingSkeleton() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const lineWidths = ['w-full', 'w-[78%]', 'w-[90%]', 'w-[58%]']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-md sm:p-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-start gap-4">
        <motion.div
          animate={reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 shadow-[0_0_0_1px_rgba(99,102,241,0.12)]"
        >
          <WandSparkles className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
            <Sparkles className="h-4 w-4 text-brand-600" />
            {t('common.loadingText')}
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Analyse du sujet, création des idées et mise en forme…
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 shadow-[0_0_8px_rgba(79,70,229,0.45)]"
              animate={reduceMotion ? { x: 0 } : { x: ['-115%', '315%'] }}
              transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
      <div className="relative mt-6 space-y-3 border-t border-zinc-100 pt-5">
        {lineWidths.map((width, index) => (
          <ShimmerBlock
            key={width}
            className={`h-3 ${width}`}
            delay={index * 0.18}
            reduceMotion={reduceMotion}
          />
        ))}
        <div className="flex gap-3 pt-1">
          <ShimmerBlock className="h-8 w-8 rounded-lg" delay={0.4} reduceMotion={reduceMotion} />
          <div className="flex-1 space-y-2 pt-1">
            <ShimmerBlock className="h-3 w-[64%]" delay={0.5} reduceMotion={reduceMotion} />
            <ShimmerBlock className="h-3 w-[42%]" delay={0.62} reduceMotion={reduceMotion} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
