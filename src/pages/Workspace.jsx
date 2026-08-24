import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  CheckCircle2,
  Download,
  Eye,
  EyeOff,
  FolderKanban,
  Loader2,
  RotateCcw,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react'
import CopyButton from '../components/CopyButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import * as workspace from '../services/workspace.js'
import { sendAgentMessage } from '../services/aiEngine.js'
import { supabase, isSupabaseConfigured } from '../services/supabase.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

const TABS = [
  { id: 'all', label: 'ws.tabAll' },
  { id: 'draft', label: 'ws.tabTodo' },
  { id: 'done', label: 'ws.tabDone' },
  { id: 'fav', label: 'ws.tabFav' },
]

const IMPROVEMENT_PRESETS = [
  ['imp.hooks', 'ðŸ”¥'],
  ['imp.script', 'âœï¸'],
  ['imp.cta', 'ðŸŽ¯'],
  ['imp.instagram', 'ðŸ“±'],
  ['imp.youtube', 'â–¶ï¸'],
  ['imp.short30', 'âš¡'],
  ['imp.pedagogic', 'ðŸ§ '],
  ['imp.natural', 'ðŸ’¬'],
]

function ImprovementPanel({ project }) {
  const { user, refreshCredits } = useOutletContext()
  const { t } = useI18n()
  const [reply, setReply] = useState('')
  const [instruction, setInstruction] = useState('')
  const [busyKey, setBusyKey] = useState('')
  const [error, setError] = useState('')
  const [saveState, setSaveState] = useState('idle')

  async function improve(key) {
    if (busyKey) return
    const text = t(`improve.${key}`)
    setBusyKey(key)
    setError('')
    setSaveState('idle')
    try {
      const answer = await sendAgentMessage(text, [], project.content)
      setReply(answer)
      setInstruction(text)
      await refreshCredits('kitbot')
    } catch (err) {
      setError(friendlyError(err, t))
    } finally {
      setBusyKey('')
    }
  }

  async function saveVersion() {
    if (!isSupabaseConfigured || !supabase || !user || !reply) return
    setSaveState('saving')
    const { error: saveError } = await supabase.from('saved_projects').insert({
      user_id: user.id,
      title: `${project.title} â€” v2`.slice(0, 140),
      type: project.type,
      status: 'draft',
      platform: project.platform,
      niche: project.niche,
      topic: project.topic,
      content: { ...project.content, improvement: { instruction, text: reply } },
    })
    setSaveState(saveError ? 'error' : 'done')
    if (!saveError) setTimeout(() => setSaveState('idle'), 2500)
  }

  return (
    <section data-background-lock className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
      <h5 className="flex items-center gap-2 text-sm font-semibold text-blue-700">
        <Sparkles className="h-4 w-4" /> {t('improve.title')}
      </h5>
      <div className="mt-3 flex flex-wrap gap-2">
        {IMPROVEMENT_PRESETS.map(([key, emoji]) => (
          <button
            key={key}
            type="button"
            onClick={() => improve(key)}
            disabled={Boolean(busyKey)}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span aria-hidden>{emoji}</span> {t(`improve.${key}`)}
          </button>
        ))}
      </div>
      {busyKey && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> KitBot rÃ©Ã©crit... âš¡
        </p>
      )}
      {error && (
        <p className="animate-shake mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}
      {reply && !busyKey && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h6 className="text-xs font-semibold text-zinc-950">{t('improve.result')}</h6>
            <CopyButton value={reply} />
          </div>
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-700">
            {reply}
          </div>
          <button
            type="button"
            onClick={saveVersion}
            disabled={!isSupabaseConfigured || !user || saveState === 'saving' || saveState === 'done'}
            className="btn-ghost !rounded-lg !px-3 !py-1.5 !text-xs"
          >
            {saveState === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Sparkles className="h-3.5 w-3.5" />}
            {saveState === 'done' ? t('improve.saved') : saveState === 'saving' ? t('common.generating') : t('improve.saveVersion')}
          </button>
          {saveState === 'error' && (
            <p className="text-xs text-red-300">{t('errors.generic')}</p>
          )}
        </div>
      )}
    </section>
  )
}

const STATUS_STYLES = {
  draft: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  done: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  archived: 'border-zinc-200 bg-zinc-50 text-zinc-500',
}

function PackDetail({ content }) {
  const { t } = useI18n()
  if (!content || typeof content !== 'object') {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-xs text-zinc-700">
        {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
      </pre>
    )
  }
  return (
    <div className="space-y-5">
      {Array.isArray(content.hooks) && content.hooks.length > 0 && (
        <section>
          <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-950">
            ðŸŽ£ {t('pack.hooks')}
          </h5>
          <ul className="space-y-1.5">
            {content.hooks.map((hook, i) => (
              <li key={i} className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
                <span className="mr-2 font-medium text-zinc-500">{i + 1}.</span>{hook.text}
                {hook.visual && <p className="mt-1 text-xs text-zinc-400">ðŸŽ¬ {hook.visual}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {content.script && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h5 className="text-sm font-semibold text-zinc-950">ðŸŽ¬ {t('pack.script')}</h5>
            <CopyButton
              value={[content.script.intro, content.script.body, content.script.cta]
                .filter(Boolean)
                .join('\n\n')}
            />
          </div>
          <div className="space-y-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm leading-relaxed text-zinc-700">
            {content.script.intro && <p><span className="font-semibold text-zinc-500">[0-5s]</span> {content.script.intro}</p>}
            {content.script.body && <p><span className="font-semibold text-zinc-500">[5-45s]</span> {content.script.body}</p>}
            {Array.isArray(content.script.broll_ideas) && content.script.broll_ideas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {content.script.broll_ideas.map((idea, i) => (
                  <span key={i} className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs text-zinc-700">ðŸŽ¥ {idea}</span>
                ))}
              </div>
            )}
            {content.script.cta && <p><span className="font-semibold text-zinc-500">[45-60s]</span> {content.script.cta}</p>}
          </div>
        </section>
      )}
      {(content.seo_title || Array.isArray(content.hashtags)) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {content.seo_title && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h5 className="text-sm font-semibold text-zinc-950">ðŸ“Œ {t('pack.seoTitle')}</h5>
                <CopyButton value={content.seo_title} />
              </div>
              <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-950">{content.seo_title}</p>
            </div>
          )}
          {Array.isArray(content.hashtags) && content.hashtags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h5 className="text-sm font-semibold text-zinc-950">#ï¸âƒ£ {t('pack.hashtags')}</h5>
                <CopyButton value={content.hashtags.join(' ')} />
              </div>
              <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-brand-700">{content.hashtags.join(' ')}</p>
            </div>
          )}
        </section>
      )}
      {Array.isArray(content.next_ideas) && content.next_ideas.length > 0 && (
        <section>
          <h5 className="mb-2 text-sm font-semibold text-zinc-950">ðŸ’¡ {t('pack.nextIdeas')}</h5>
          <ol className="list-inside list-decimal space-y-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-sm text-zinc-700">
            {content.next_ideas.map((idea, i) => <li key={i}>{idea}</li>)}
          </ol>
        </section>
      )}
      {content.improvement?.text && (
        <section className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <h5 className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
              âœ¨ {t('ws.improvedVersion')}
            </h5>
            <CopyButton value={content.improvement.text} />
          </div>
          {content.improvement.instruction && (
            <p className="mb-1.5 text-xs italic text-zinc-400">{content.improvement.instruction}</p>
          )}
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {content.improvement.text}
          </div>
        </section>
      )}
    </div>
  )
}

function ProjectCard({ project, onChanged, onDeleted }) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const [busy, setBusy] = useState(false)

  async function run(action, ...args) {
    if (busy) return
    setBusy(true)
    try {
      const updated = await action(...args)
      if (updated) onChanged(updated)
    } catch (err) {
      alert(friendlyError(err, t))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (busy || !window.confirm(t('ws.confirmDelete'))) return
    setBusy(true)
    try {
      await workspace.deleteProject(project.id)
      onDeleted(project.id)
    } catch (err) {
      alert(friendlyError(err, t))
      setBusy(false)
    }
  }

  return (
    <article data-background-lock className="card space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-zinc-950">{project.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
            <span>{project.platform}</span>
            {project.niche && <><span aria-hidden>Â·</span><span>{project.niche}</span></>}
            {project.topic && <><span aria-hidden>Â·</span><span className="truncate">{project.topic}</span></>}
            <span aria-hidden>Â·</span>
            <time dateTime={project.created_at}>
              {new Date(project.created_at).toLocaleDateString()}
            </time>
          </p>
        </div>
        <button
          type="button"
          onClick={() => run(workspace.toggleFavorite, project.id, project.is_favorite)}
          disabled={busy}
          aria-label={t('ws.fav')}
          className={`shrink-0 rounded-lg p-1.5 transition ${
            project.is_favorite
              ? 'text-amber-300 hover:bg-amber-400/10'
              : 'text-zinc-400 hover:bg-zinc-50 hover:text-zinc-700'
          }`}
        >
          <Star className={`h-4.5 w-4.5 ${project.is_favorite ? 'fill-amber-300' : ''}`} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[project.status] ?? STATUS_STYLES.draft}`}>
          {t(`ws.status.${project.status}`)}
        </span>
        {Array.isArray(project.content?.hooks) && (
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs text-zinc-500">
            ðŸŽ£ Ã—{project.content.hooks.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setExpanded((v) => !v)} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100">
          {expanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {expanded ? t('ws.hide') : t('ws.view')}
        </button>
        {project.status === 'done' ? (
          <button type="button" onClick={() => run(workspace.updateStatus, project.id, 'draft')} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50">
            <RotateCcw className="h-3.5 w-3.5" /> {t('ws.backToDraft')}
          </button>
        ) : (
          <button type="button" onClick={() => run(workspace.updateStatus, project.id, 'done')} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t('ws.markDone')}
          </button>
        )}
        <button type="button" onClick={handleDelete} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-400/15 disabled:opacity-50">
          <Trash2 className="h-3.5 w-3.5" /> {t('ws.delete')}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-zinc-100 pt-4">
          <PackDetail content={project.content} />
          {Array.isArray(project.content?.hooks) && <ImprovementPanel project={project} />}
        </div>
      )}
    </article>
  )
}

export default function Workspace() {
  const { t } = useI18n()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await workspace.getProjects()
        if (!cancelled) setProjects(data)
      } catch (err) {
        if (!cancelled) setError(friendlyError(err, t))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function applyUpdate(updated) {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)),
    )
  }

  function counts(list) {
    return {
      all: list.length,
      draft: list.filter((p) => p.status === 'draft').length,
      done: list.filter((p) => p.status === 'done').length,
      fav: list.filter((p) => p.is_favorite).length,
    }
  }

  // Export .txt : dump rÃ©cursif lisible de tout le contenu sauvegardÃ©
  function dumpValue(value, indent = '') {
    if (value == null) return ''
    if (typeof value === 'string') return value
    if (Array.isArray(value)) {
      return value.map((v) => `${indent}- ${dumpValue(v).trimStart()}`).join('\n')
    }
    return Object.entries(value)
      .map(([key, v]) => {
        const label = key.replace(/_/g, ' ')
        if (v != null && typeof v === 'object') {
          return `\n${indent}${label.toUpperCase()}\n${dumpValue(v, indent + '  ')}`
        }
        return `${indent}${label}: ${v}`
      })
      .join('\n')
  }

  function exportAll() {
    const blocks = projects.map((p) =>
      [
        '='.repeat(52),
        p.title || '(?)',
        [p.platform, p.type, p.status, p.topic].filter(Boolean).join(' Â· '),
        '',
        dumpValue(p.content),
        '',
      ].join('\n'),
    )
    const blob = new Blob([`KitCreator â€” Workspace\n\n${blocks.join('\n')}`], {
      type: 'text/plain;charset=utf-8',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kitcreator-workspace-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const c = counts(projects)
  const visible =
    tab === 'all' ? projects
    : tab === 'draft' ? projects.filter((p) => p.status === 'draft')
    : tab === 'done' ? projects.filter((p) => p.status === 'done')
    : projects.filter((p) => p.is_favorite)

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-zinc-200 bg-white px-6 py-6 shadow-md transition-shadow duration-200 hover:shadow-lg">
        
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
              <FolderKanban className="h-3.5 w-3.5" /> Workspace
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{t('ws.title')}</h2>
            {!loading && !error && (
              <p className="mt-2 text-sm text-zinc-500">{c.all} {t('ws.items')}</p>
            )}
          </div>
          {!loading && !error && projects.length > 0 && (
            <button
              type="button"
              onClick={exportAll}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
            >
              <Download className="h-4 w-4" /> {t('ws.exportAll')}
            </button>
          )}
        </div>
      </div>

      {!loading && !error && projects.length > 0 && (
        <div data-background-lock className="card flex flex-wrap gap-2">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                tab === id
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
              }`}
            >
              {t(label)}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${tab === id ? 'bg-white/20' : 'bg-zinc-100'}`}>
                {c[id]}
              </span>
            </button>
          ))}
        </div>
      )}

      {loading && <LoadingSkeleton />}
      {error && (
        <p className="animate-shake rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && projects.length === 0 && (
        <div data-background-lock className="card flex flex-col items-center gap-4 py-14 text-center">
          <FolderKanban className="h-12 w-12 text-zinc-400" />
          <div>
            <h3 className="text-base font-semibold text-zinc-950">{t('ws.empty.title')}</h3>
            <p className="mt-1 text-sm text-zinc-500">{t('ws.empty.text')}</p>
          </div>
          <Link
            to="/dashboard/pack"
            className="btn-primary"
          >
            {t('ws.empty.cta')}
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onChanged={applyUpdate}
            onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
          />
        ))}
      </div>
    </div>
  )
}
