'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const PROJECT_TYPES = ['Portfólio', 'Freela', 'SaaS', 'Uso pessoal', 'Empresa']
const COMPLEXITIES = ['Só frontend', 'Frontend + Backend', 'Completo com auth e banco']

function suggestStack(type: string, complexity: string): string[] {
  if (complexity === 'Só frontend') {
    return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS']
  }
  if (type === 'SaaS' && complexity === 'Completo com auth e banco') {
    return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Prisma ORM']
  }
  if (type === 'Portfólio') {
    return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS']
  }
  if (type === 'Freela' && complexity === 'Completo com auth e banco') {
    return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'Prisma ORM', 'JWT']
  }
  if (type === 'Empresa') {
    return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'Prisma ORM', 'JWT', 'Docker']
  }
  return ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'NestJS', 'PostgreSQL', 'Prisma ORM']
}

const ALL_TECHS = [
  'Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'shadcn/ui',
  'React Hook Form', 'Zod', 'Axios', 'NestJS', 'PostgreSQL', 'Prisma ORM',
  'JWT', 'Redis', 'BullMQ', 'Supabase', 'Vitest', 'Jest', 'Supertest',
  'React Native', 'Expo', 'Python', 'FastAPI', 'LangChain', 'Docker',
  'GitHub Actions', 'Vercel', 'Railway', 'AWS',
]

type Step = 'name' | 'type' | 'complexity' | 'stack'

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('name')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [complexity, setComplexity] = useState('')
  const [stack, setStack] = useState<string[]>([])
  const [stackSource, setStackSource] = useState<'suggested' | 'custom'>('suggested')
  const [loading, setLoading] = useState(false)

  function handleComplexitySelect(value: string) {
    setComplexity(value)
    const suggested = suggestStack(type, value)
    setStack(suggested)
    setStackSource('suggested')
    setStep('stack')
  }

  function toggleTech(tech: string) {
    setStackSource('custom')
    setStack(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    )
  }

  async function handleCreate() {
    if (!name || !type || !complexity || stack.length === 0) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('projects').insert({
      name,
      type,
      complexity,
      stack,
      stack_source: stackSource,
      user_id: user.id,
    }).select().single()

    if (!error && data) {
      router.push(`/dashboard/${data.id}`)
      router.refresh()
      onClose()
    }

    setLoading(false)
  }

  const steps: Step[] = ['name', 'type', 'complexity', 'stack']
  const stepIndex = steps.indexOf(step)

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#141414] border border-[#252525] rounded-xl w-full max-w-lg p-6">

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1.5">
            {steps.map((s, i) => (
              <div
                key={s}
                className="h-1 w-8 rounded-full transition-colors"
                style={{ background: i <= stepIndex ? '#3ecf8e' : '#2a2a2a' }}
              />
            ))}
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-[#c8c8c8] text-lg">×</button>
        </div>

        {/* Step: Nome */}
        {step === 'name' && (
          <div>
            <h2 className="font-mono text-base font-medium text-white mb-4">
              Nome do projeto
            </h2>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim().length > 2 && setStep('type')}
              placeholder="ex: SaaS de agendamentos, Portfolio pessoal..."
              className="w-full bg-[#0e0e0e] border border-[#252525] rounded-lg text-[#e8e8e8] text-sm px-4 py-2.5 outline-none focus:border-[#3ecf8e44] placeholder:text-[#444]"
            />
          </div>
        )}

        {/* Step: Tipo */}
        {step === 'type' && (
          <div>
            <h2 className="font-mono text-base font-medium text-white mb-4">
              Objetivo do projeto
            </h2>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => { setType(t); setStep('complexity') }}
                  className="px-4 py-2 bg-[#0e0e0e] border border-[#252525] rounded-lg text-sm text-[#888] hover:border-[#3ecf8e] hover:text-[#3ecf8e] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Complexidade */}
        {step === 'complexity' && (
          <div>
            <h2 className="font-mono text-base font-medium text-white mb-2">
              Nível de complexidade
            </h2>
            <p className="text-xs text-[#555] mb-4">
              O mentor vai sugerir a stack ideal com base na sua resposta.
            </p>
            <div className="flex flex-col gap-2">
              {COMPLEXITIES.map(c => (
                <button
                  key={c}
                  onClick={() => handleComplexitySelect(c)}
                  className="text-left px-4 py-3 bg-[#0e0e0e] border border-[#252525] rounded-lg text-sm text-[#888] hover:border-[#3ecf8e] hover:text-[#3ecf8e] transition-colors"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Stack */}
        {step === 'stack' && (
          <div>
            <h2 className="font-mono text-base font-medium text-white mb-1">
              Stack sugerida
            </h2>
            <p className="text-xs text-[#555] mb-4">
              Baseado em {type} + {complexity}. Ajuste se necessário.
            </p>
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
              {ALL_TECHS.map(tech => (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                    stack.includes(tech)
                      ? 'bg-[#1a2a1a] border-[#3ecf8e66] text-[#3ecf8e]'
                      : 'bg-[#0e0e0e] border-[#252525] text-[#666]'
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
            {stackSource === 'suggested' && (
              <p className="text-xs text-[#3ecf8e] mt-3">
                ✓ Stack sugerida pelo mentor
              </p>
            )}
            {stackSource === 'custom' && (
              <p className="text-xs text-[#d4852a] mt-3">
                ✎ Stack personalizada
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#1e1e1e]">
          <button
            onClick={() => {
              const prev: Record<Step, Step> = { name: 'name', type: 'name', complexity: 'type', stack: 'complexity' }
              setStep(prev[step])
            }}
            className={`text-sm text-[#555] hover:text-[#c8c8c8] transition-colors ${step === 'name' ? 'invisible' : ''}`}
          >
            ← Voltar
          </button>

          {step === 'name' && (
            <button
              disabled={name.trim().length <= 2}
              onClick={() => setStep('type')}
              className="px-4 py-2 bg-[#1e2e1e] border border-[#3ecf8e44] rounded-lg text-sm text-[#3ecf8e] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Próximo →
            </button>
          )}

          {step === 'stack' && (
            <button
              disabled={stack.length === 0 || loading}
              onClick={handleCreate}
              className="px-4 py-2 bg-[#1e2e1e] border border-[#3ecf8e] rounded-lg text-sm text-[#3ecf8e] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar projeto ✓'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}