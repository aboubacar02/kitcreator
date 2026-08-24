import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, WandSparkles } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function LoadingSkeleton() {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const lineWidths = ['w-full', 'w-[78%]', 'w-[90%]', 'w-[58%]']

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32 }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-start gap-4">
        <motion.div
          animate={reduceMotion ? undefined : { rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"
        >
          <WandSparkles className="h-5 w-5" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Sparkles className="h-4 w-4 text-brand-600" />
            {t('common.loadingText')}
          </p>
          <p className="mt-1 text-xs text-zinc-400">Analyse du sujet, création des idées et mise en forme…</p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <motion.div
              className="h-full w-1/3 rounded-full bg-zinc-900"
              animate={reduceMotion ? { x: 0 } : { x: ['-115%', '315%'] }}
              transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
      <div className="relative mt-6 space-y-3 border-t border-zinc-100 pt-5">
        {lineWidths.map((width, index) => (
          <motion.div
            key={width}
            className={`h-3 rounded-full bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-100 ${width}`}
            animate={reduceMotion ? { opacity: 0.7 } : { opacity: [0.45, 0.95, 0.45] }}
            transition={{ duration: 1.25, delay: index * 0.13, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </motion.div>
  )
}
