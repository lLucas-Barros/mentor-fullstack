'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const SKILL_LEVELS = ['Nunca usei', 'Já vi', 'Uso com ajuda', 'Uso com confiança']
const SKILL_COLORS = ['#e05252', '#d4852a', '#4a9eff', '#3ecf8e']

type ProfileLevel = {
  id?: string
  project_id: string
  technology: string
  level: string
}

type Project = {
  id: string
  stack: string[]
}

export default function ProfilePanel({
  project,
  initialLevels,
}: {
  project: Project
  initialLevels: ProfileLevel[]
}) {
  const [levels, setLevels] = useState<Record<string, string>>(
    Object.fromEntries(initialLevels.map(l => [l.technology, l.level]))
  )
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  async function setLevel(technology: string, level: string) {
    setSaving(technology)
    setLevels(prev => ({ ...prev, [technology]: level }))

    const existing = initialLevels.find(l => l.technology === technology)

    if (existing) {
      await supabase
        .from('profile_levels')
        .update({ level })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('profile_levels')
        .insert({ project_id: project.id, technology, level })
    }

    setSaving(null)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl">
        <p className="text-sm text-[#555] mb-6 leading-relaxed">
          Defina seu nível em cada tecnologia. O mentor adapta a abordagem de ensino com base nesses dados.
        </p>
        <div className="space-y-3">
          {project.stack.map(tech => {
            const currentLevel = levels[tech]
            const levelIndex = SKILL_LEVELS.indexOf(currentLevel)

            return (
              <div key={tech} className="bg-[#141414] border border-[#1e1e1e] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono font-medium text-[#e8e8e8]">{tech}</span>
                  {saving === tech && (
                    <span className="text-[10px] text-[#555]">salvando...</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {SKILL_LEVELS.map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLevel(tech, label)}
                      className="px-3 py-1.5 rounded-md text-xs border transition-colors"
                      style={
                        currentLevel === label
                          ? {
                              background: SKILL_COLORS[idx] + '22',
                              color: SKILL_COLORS[idx],
                              borderColor: SKILL_COLORS[idx] + '88',
                            }
                          : { background: '#0e0e0e', color: '#555', borderColor: '#252525' }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {levelIndex >= 0 && (
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: i <= levelIndex ? SKILL_COLORS[levelIndex] : '#1e1e1e' }}
                      />
                    ))}
                    <span className="text-[10px] ml-1" style={{ color: SKILL_COLORS[levelIndex] }}>
                      {currentLevel}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}