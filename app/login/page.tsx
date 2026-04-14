import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'
import { redirect } from 'next/navigation'

async function signInWithGitHub() {
  'use server'

  const supabase = await createClient()
  const siteUrl = await getSiteUrl()

  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
      <div className="w-full max-w-sm border border-[#1e1e1e] rounded-xl p-8 bg-[#141414]">
        <div className="mb-8">
          <h1 className="text-xl font-mono font-medium text-white">
            mentor<span className="text-[#3ecf8e]">_fs</span>
          </h1>
          <p className="text-sm text-[#555] mt-2">
            Seu mentor pessoal de desenvolvimento fullstack
          </p>
        </div>

        <form action={signInWithGitHub}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#c8c8c8] hover:border-[#3ecf8e] hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            Entrar com GitHub
          </button>
        </form>
      </div>
    </main>
  )
}