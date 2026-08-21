import { NavLink, useNavigate } from 'react-router-dom'
import { Zap, FileText, Hash, BarChart3, Settings, User } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'

const icons = {
  hook: Zap,
  script: FileText,
  hashtag: Hash,
  title: BarChart3,
}

export default function Sidebar({ user }) {
  const navigate = useNavigate()
  const initial = (user?.email || '?').charAt(0).toUpperCase()

  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 border-b border-slate-800/80 bg-surface/80 backdrop-blur-md p-4 md:w-64 md:border-b-0 md:border-r md:p-6">
      <nav className="flex flex-1 flex-col gap-2">
        {TOOLS.map((tool) => {
          const Icon = icons[tool.id]
          return (
            <NavLink
              key={tool.id}
              to={`/dashboard/${tool.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{tool.name}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-800 pt-4">
        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-brand-600 text-white'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`
          }
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </NavLink>

        <div
          onClick={() => navigate('/dashboard/settings')}
          className="flex cursor-pointer items-center gap-3 rounded-xl p-3 transition hover:bg-slate-800/60"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500/50 bg-brand-600/30 font-bold text-brand-300">
            <User className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500" />
            </span>
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-white">My account</p>
            <p className="truncate text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
