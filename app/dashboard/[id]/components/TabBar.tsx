'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function TabBar({ projectId }: { projectId: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { id: 'chat', label: 'Chat', path: `/dashboard/${projectId}` },
    { id: 'profile', label: 'Perfil', path: `/dashboard/${projectId}/profile` },
    { id: 'features', label: 'Features', path: `/dashboard/${projectId}/features` },
  ]

  const activeTab = pathname.endsWith('/profile')
    ? 'profile'
    : pathname.endsWith('/features')
    ? 'features'
    : 'chat'

  return (
    <div className="flex gap-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => router.push(tab.path)}
          className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
            activeTab === tab.id
              ? 'bg-[#1e1e1e] text-[#e8e8e8] border border-[#2a2a2a]'
              : 'text-[#555] hover:text-[#c8c8c8]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}