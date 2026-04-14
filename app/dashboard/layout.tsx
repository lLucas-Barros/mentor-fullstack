import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './components/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, type, complexity, stack')
    .order('created_at', { ascending: false })

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-[#c8c8c8]">
      <Sidebar projects={projects || []} user={{ email: user.email! }} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}