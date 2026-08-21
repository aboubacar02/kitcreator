import { NavLink } from 'react-router-dom'
import { Zap, FileText, Hash, BarChart3 } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'

const icons = {
  hook: Zap,
  script: FileText,
  hashtag: Hash,
  title: BarChart3,
}

export default function Sidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-2 border-b border-slate-800 bg-surface p-4 md:w-64 md:border-b-0 md:border-r md:p-6">
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
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{tool.name}</span>
          </NavLink>
        )
      })}
    </aside>
  )
}
