import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <p className="font-mono text-sm text-[#555] mb-4">404</p>
        <h1 className="text-lg text-[#c8c8c8] mb-2">Página não encontrada</h1>
        <Link
          href="/dashboard"
          className="text-sm text-[#3ecf8e] hover:underline"
        >
          Ir para o dashboard
        </Link>
      </div>
    </main>
  )
}
