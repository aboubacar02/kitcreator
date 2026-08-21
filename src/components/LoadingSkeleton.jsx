import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function LoadingSkeleton() {
  const { t } = useI18n()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-900/50 p-5"
      role="status"
      aria-live="polite"
    >
      <p className="flex items-center gap-2 text-sm font-medium text-brand-300">
        <Sparkles className="h-4 w-4 animate-pulse" />
        {t('common.loadingText')}
      </p>
      <div className="space-y-3">
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-800" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800" />
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800" />
      </div>
    </motion.div>
  )
}
