import { createClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/site-url'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const siteUrl = await getSiteUrl()
  return NextResponse.redirect(new URL('/login', siteUrl))
}
