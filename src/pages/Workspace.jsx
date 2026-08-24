import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  RotateCcw,
  Star,
  Trash2,
} from 'lucide-react'
import CopyButton from '../components/CopyButton.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import * as workspace from '../services/workspace.js'
import { useI18n } from '../i18n/LanguageContext.jsx'
import { friendlyError } from '../i18n/strings.js'

const TABS = [
  { id: 'all', label: 'ws.tabAll' },
  { id: 'draft', label: 'ws.tabTodo' },
  { id: 'done', label: 'ws.tabDone' },
  { id: 'fav', label: 'ws.tabFav' },
]

const STATUS_STYLES = {
  draft: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  done: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  archived: 'border-white/15 bg-white/[0.06] text-slate-400',
}

function PackDetail({ content }) {
  const { t } = useI18n()
  if (!content || typeof content !== 'object') {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs text-slate-300">
        {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
      </pre>
    )
  }
  return (
    <div className="space-y-5">
      {Array.isArray(content.hooks) && content.hooks.length > 0 && (
        <section>
          <h5 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
            🎣 {t('pack.hooks')}
          </h5>
          <ul className="space-y-1.5">
            {content.hooks.map((hook, i) => (
              <li key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
                <span className="mr-2 font-medium text-brand-300">{i + 1}.</span>{hook.text}
                {hook.visual && <p className="mt-1 text-xs text-brand-200/80">🎬 {hook.visual}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {content.script && (
        <section>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h5 className="text-sm font-bold uppercase tracking-wider text-slate-300">🎬 {t('pack.script')}</h5>
            <CopyButton
              value={[content.script.intro, content.script.body, content.script.cta]
                .filter(Boolean)
                .join('\n\n')}
            />
          </div>
          <div className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-slate-200">
            {content.script.intro && <p><span className="font-semibold text-slate-400">[0-5s]</span> {content.script.intro}</p>}
            {content.script.body && <p><span className="font-semibold text-slate-400">[5-45s]</span> {content.script.body}</p>}
            {Array.isArray(content.script.broll_ideas) && content.script.broll_ideas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {content.script.broll_ideas.map((idea, i) => (
                  <span key={i} className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-xs text-slate-300">🎥 {idea}</span>
                ))}
              </div>
            )}
            {content.script.cta && <p><span className="font-semibold text-slate-400">[45-60s]</span> {content.script.cta}</p>}
          </div>
        </section>
      )}
      {(content.seo_title || Array.isArray(content.hashtags)) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {content.seo_title && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h5 className="text-sm font-bold uppercase tracking-wider text-slate-300">📌 {t('pack.seoTitle')}</h5>
                <CopyButton value={content.seo_title} />
              </div>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-white">{content.seo_title}</p>
            </div>
          )}
          {Array.isArray(content.hashtags) && content.hashtags.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h5 className="text-sm font-bold uppercase tracking-wider text-slate-300">#️⃣ {t('pack.hashtags')}</h5>
                <CopyButton value={content.hashtags.join(' ')} />
              </div>
              <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-brand-200">{content.hashtags.join(' ')}</p>
            </div>
          )}
        </section>
      )}
      {Array.isArray(content.next_ideas) && content.next_ideas.length > 0 && (
        <section>
          <h5 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-300">💡 {t('pack.nextIdeas')}</h5>
          <ol className="list-inside list-decimal space-y-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-sm text-slate-200">
            {content.next_ideas.map((idea, i) => <li key={i}>{idea}</li>)}
          </ol>
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
          <h3 className="truncate font-bold text-white">{project.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            <span>{project.platform}</span>
            {project.niche && <><span aria-hidden>·</span><span>{project.niche}</span></>}
            {project.topic && <><span aria-hidden>·</span><span className="truncate">{project.topic}</span></>}
            <span aria-hidden>·</span>
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
              : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-300'
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
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-slate-400">
            🎣 ×{project.content.hooks.length}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setExpanded((v) => !v)} disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08]">
          {expanded ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {expanded ? t('ws.hide') : t('ws.view')}
        </button>
        {project.status === 'done' ? (
          <button type="button" onClick={() => run(workspace.updateStatus, project.id, 'draft')} disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50">
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
        <div className="border-t border-white/[0.06] pt-4">
          <PackDetail content={project.content} />
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

  const c = counts(projects)
  const visible =
    tab === 'all' ? projects
    : tab === 'draft' ? projects.filter((p) => p.status === 'draft')
    : tab === 'done' ? projects.filter((p) => p.status === 'done')
    : projects.filter((p) => p.is_favorite)

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/60 px-6 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-200">
              <FolderKanban className="h-3.5 w-3.5" /> Workspace
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">{t('ws.title')}</h2>
            {!loading && !error && (
              <p className="mt-2 text-sm text-slate-400">{c.all} {t('ws.items')}</p>
            )}
          </div>
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
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/15'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {t(label)}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${tab === id ? 'bg-white/20' : 'bg-white/[0.08]'}`}>
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
          <FolderKanban className="h-12 w-12 text-slate-600" />
          <div>
            <h3 className="text-lg font-bold text-white">{t('ws.empty.title')}</h3>
            <p className="mt-1 text-sm text-slate-400">{t('ws.empty.text')}</p>
          </div>
          <Link
            to="/dashboard/pack"
            className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-600"
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
