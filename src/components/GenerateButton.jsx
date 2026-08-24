import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function GenerateButton({ loading, disabled, children }) {
  const { t } = useI18n()
  const reduceMotion = useReducedMotion()
  const isDisabled = loading || disabled

  return (
    <motion.button
      type="submit"
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      className="btn-primary relative w-full !overflow-hidden !py-3 !text-base"
    >
      <motion.span
        className="relative z-10 flex items-center justify-center gap-2"
        animate={loading && !reduceMotion ? { opacity: [0.82, 1, 0.82] } : undefined}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {loading ? t('common.generating') : children}
      </motion.span>

      {loading && !reduceMotion && (
        <motion.span
          aria-hidden
          className="absolute bottom-0 left-0 z-0 h-[3px] w-1/3 rounded-full bg-gradient-to-r from-brand-300 via-brand-500 to-brand-300"
          initial={{ x: '-110%' }}
          animate={{ x: '320%' }}
          transition={{ duration: 1.25, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.button>
  )
}
