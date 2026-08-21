import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useI18n } from '../i18n/LanguageContext.jsx'

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-5 break-words text-xl font-bold text-white first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 break-words text-lg font-bold text-white first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 break-words text-base font-semibold text-white first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-3 break-words text-sm leading-relaxed text-slate-200 first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-brand-400">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-brand-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="break-words pl-1 text-sm leading-relaxed text-slate-200">
      {children}
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-brand-500 pl-4 italic text-slate-400">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[0.8em] text-brand-300">
        {children}
      </code>
    ) : (
      <code className="block overflow-x-auto rounded-lg bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-300">
        {children}
      </code>
    ),
  pre: ({ children }) => <pre className="my-3 max-w-full">{children}</pre>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-slate-800" />,
}

function CopyButton({ text }) {
  const { t } = useI18n()
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={t('result.copy')}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
        copied
          ? 'bg-green-500/15 text-green-400'
          : 'bg-slate-800 text-slate-300 hover:bg-brand-600 hover:text-white'
      }`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t('result.copied') : t('result.copy')}
    </motion.button>
  )
}

function Celebration() {
  const particles = Array.from({ length: 10 })
  return (
    <div className="pointer-events-none absolute left-1/2 top-0">
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(angle) * 80,
              y: Math.sin(angle) * 60 + 40,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className={`absolute h-1.5 w-1.5 rounded-full ${
              i % 3 === 0 ? 'bg-brand-400' : i % 3 === 1 ? 'bg-fuchsia-400' : 'bg-white'
            }`}
          />
        )
      })}
    </div>
  )
}

export default function ResultCard({ title, content }) {
  const { t } = useI18n()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative w-full max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6"
    >
      <Celebration />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          {title ?? t('result.title')}
        </h3>
        <CopyButton text={content} />
      </div>
      <div className="max-w-full overflow-x-hidden break-words">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  )
}
