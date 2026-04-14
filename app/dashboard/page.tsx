import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="border border-[#1e1e1e] rounded-xl p-8 bg-[#141414]">
        <h1 className="text-xl font-mono font-medium text-white mb-2">
          mentor<span className="text-[#3ecf8e]">_fs</span>
        </h1>
        <p className="text-sm text-[#555]">
          Logado como <span className="text-[#c8c8c8]">{user.email}</span>
        </p>
      </div>
    </main>
  )
}