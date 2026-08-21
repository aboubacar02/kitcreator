import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`shrink-0 rounded-lg p-2.5 transition ${
        copied
          ? 'bg-slate-800 text-green-400'
          : 'bg-slate-800 text-slate-300 hover:bg-brand-600 hover:text-white'
      }`}
      aria-label="Copy"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </motion.button>
  )
}

export default function ResultCard({ title, content }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
      {blocks.map((block, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className="group flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-brand-500/50"
        >
          <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-200">
            {block}
          </pre>
          <CopyButton text={block} />
        </motion.div>
      ))}
    </div>
  )
}
