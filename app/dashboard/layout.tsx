import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from './components/DashboardShell'

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
    <DashboardShell projects={projects || []} user={{ email: user.email! }}>
      {children}
    </DashboardShell>
  )
}