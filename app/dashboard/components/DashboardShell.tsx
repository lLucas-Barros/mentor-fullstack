'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import NewProjectModal from './NewProjectModal'

type Project = {
  id: string
  name: string
  type: string
  complexity: string
  stack: string[]
}

export default function DashboardShell({
  projects,
  user,
  children,
}: {
  projects: Project[]
  user: { email: string }
  children: React.ReactNode
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-[#c8c8c8]">
      <Sidebar
        projects={projects}
        user={user}
        onNewProject={() => setShowModal(true)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
      {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
    </div>
  )
}