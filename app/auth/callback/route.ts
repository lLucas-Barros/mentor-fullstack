import { createClient } from '@/lib/supabase/server'
import { getSiteUrlFromRequest } from '@/lib/site-url'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  const siteUrl = getSiteUrlFromRequest(request)
  return NextResponse.redirect(new URL('/dashboard', siteUrl))
}