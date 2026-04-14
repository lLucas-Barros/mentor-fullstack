import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ProfilePanel from '../components/ProfilePanel'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const { data: profileLevels } = await supabase
    .from('profile_levels')
    .select('*')
    .eq('project_id', id)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 h-12 border-b border-[#1e1e1e] bg-[#141414] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-[#e8e8e8]">{project.name}</span>
          <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded" style={{ color: '#3ecf8e', background: '#3ecf8e22' }}>{project.type}</span>
        </div>
        <TabBarImport projectId={id} />
      </div>
      <ProfilePanel project={project} initialLevels={profileLevels || []} />
    </div>
  )
}

import TabBarImport from '../components/TabBar'