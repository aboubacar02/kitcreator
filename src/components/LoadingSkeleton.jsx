import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 rounded-xl border border-slate-800/80 bg-slate-900/50 p-5"
    >
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-800" />
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-800" />
      <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800" />
    </motion.div>
  )
}
