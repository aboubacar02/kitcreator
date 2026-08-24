import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function GenerateButton({ loading, disabled, children }) {
  const { t } = useI18n()
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="btn-primary w-full !py-3 !text-base"
    >
      {loading ? (
        <Zap className="h-5 w-5 animate-spin" />
      ) : (
        <Sparkles className="h-5 w-5" />
      )}
      {loading ? t('common.generating') : children}
    </motion.button>
  )
}
