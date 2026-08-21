import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'

export default function GenerateButton({ loading, disabled, children }) {
  return (
    <motion.button
      type="submit"
      disabled={loading || disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="btn-primary w-full !py-3.5 !text-base shadow-lg shadow-brand-600/20"
    >
      {loading ? (
        <Zap className="h-5 w-5 animate-spin" />
      ) : (
        <Sparkles className="h-5 w-5" />
      )}
      {loading ? 'Generating...' : children}
    </motion.button>
  )
}
