import { NavLink, useNavigate } from 'react-router-dom'
import { Bot, FolderKanban, Settings, User } from 'lucide-react'
import { TOOLS } from '../services/aiEngine.js'
import { TOOL_ICONS } from './toolIcons.js'
import { useI18n } from '../i18n/LanguageContext.jsx'

export default function Sidebar({ user }) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
      isActive
        ? 'bg-brand-50 font-semibold text-brand-700'
        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950'
    }`

  return (
    <aside className="hidden w-full shrink-0 flex-col gap-2 border-b border-zinc-200 bg-white p-4 md:flex md:w-60 md:border-b-0 md:border-r md:p-5">
      <nav className="flex flex-1 flex-col gap-1">
        {TOOLS.map((tool) => {
          const Icon = TOOL_ICONS[tool.id]
          return (
            <NavLink key={tool.id} to={`/dashboard/${tool.id}`} className={linkClass}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{t(`tools.${tool.id}`)}</span>
            </NavLink>
          )
        })}

        <NavLink to="/dashboard/kitbot" className={linkClass}>
          <Bot className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">KitBot</span>
        </NavLink>

        <NavLink to="/dashboard/workspace" className={linkClass}>
          <FolderKanban className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">{t('ws.title')}</span>
        </NavLink>
      </nav>

      <div className="space-y-1 border-t border-zinc-200 pt-4">
        <NavLink to="/dashboard/settings" className={linkClass}>
          <Settings className="h-4 w-4 shrink-0" />
          <span>{t('sidebar.settings')}</span>
        </NavLink>

        <div
          onClick={() => navigate('/dashboard/settings')}
          className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
            <User className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-zinc-950">{t('sidebar.myAccount')}</p>
            <p className="truncate text-xs text-zinc-400">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
