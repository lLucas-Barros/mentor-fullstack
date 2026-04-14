import { headers } from 'next/headers'

/**
 * URL pública do site para redirects (OAuth, signOut).
 * Em produção na Vercel, se NEXT_PUBLIC_SITE_URL não estiver definido,
 * usa o host da requisição (x-forwarded-host / host).
 */
export async function getSiteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (env) return env

  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  if (host) {
    return `${proto}://${host.split(',')[0].trim()}`
  }

  return 'http://localhost:3000'
}

export function getSiteUrlFromRequest(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (env) return env

  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost.split(',')[0].trim()}`
  }

  return new URL(request.url).origin
}
