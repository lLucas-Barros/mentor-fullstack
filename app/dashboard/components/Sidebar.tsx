'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type Project = {
  id: string
  name: string
  type: string
  complexity: string
  stack: string[]
}

type SidebarProps = {
  projects: Project[]
  user: { email: string }
  onNewProject: () => void
}

const TYPE_COLORS: Record<string, string> = {
  'Portfólio': '#4a9eff',
  'Freela': '#d4852a',
  'SaaS': '#3ecf8e',
  'Uso pessoal': '#a78bfa',
  'Empresa': '#e05252',
}

export default function Sidebar({ projects, user, onNewProject }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  function getActiveProjectId() {
    const match = pathname.match(/\/dashboard\/([^/]+)/)
    return match ? match[1] : null
  }

  const activeId = getActiveProjectId()

  return (
    <aside
      style={{ width: collapsed ? 48 : 240 }}
      className="flex flex-col h-screen bg-[#141414] border-r border-[#1e1e1e] transition-all duration-200 flex-shrink-0"
    >
      <div className="flex items-center justify-between px-3 h-12 border-b border-[#1e1e1e]">
        {!collapsed && (
          <span className="font-mono text-sm font-medium text-white">
            mentor<span className="text-[#3ecf8e]">_fs</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="text-[#555] hover:text-[#c8c8c8] transition-colors ml-auto"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="4" width="12" height="1.5" rx="0.75"/>
            <rect x="2" y="7.25" width="8" height="1.5" rx="0.75"/>
            <rect x="2" y="10.5" width="12" height="1.5" rx="0.75"/>
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="px-2 pt-3 pb-1">
            <button
              onClick={onNewProject}
              className="w-full flex items-center gap-2 px-3 py-2 text-[#3ecf8e] text-sm border border-dashed border-[#3ecf8e44] rounded-md hover:bg-[#1a2a1a] transition-colors"
            >
              <span className="text-base leading-none">+</span>
              Novo projeto
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-1">
            {projects.length === 0 && (
              <p className="text-xs text-[#444] px-2 py-3 text-center">
                Nenhum projeto ainda
              </p>
            )}
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => router.push(`/dashboard/${project.id}`)}
                className={`w-full text-left px-3 py-2.5 rounded-md mb-1 border transition-colors ${
                  activeId === project.id
                    ? 'bg-[#1a1a1a] border-[#2a2a2a]'
                    : 'border-transparent hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="text-sm font-medium text-[#d8d8d8] truncate mb-1">
                  {project.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
                    style={{
                      color: TYPE_COLORS[project.type] || '#666',
                      background: (TYPE_COLORS[project.type] || '#666') + '22',
                    }}
                  >
                    {project.type}
                  </span>
                  <span className="text-[10px] text-[#444]">
                    {project.stack.length} techs
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="px-3 py-3 border-t border-[#1e1e1e]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1a2a1a] border border-[#3ecf8e44] flex items-center justify-center text-[10px] text-[#3ecf8e] font-mono font-medium flex-shrink-0">
                {user.email[0].toUpperCase()}
              </div>
              <span className="text-xs text-[#555] truncate">{user.email}</span>
            </div>
          </div>
        </>
      )}
    </aside>
  )
}