'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Feature = {
  id: string
  project_id: string
  name: string
  status: string
  branch: string
  notes: string
  created_at: string
}

const STATUS_OPTIONS = ['planned', 'in_progress', 'done']
const STATUS_LABELS: Record<string, string> = {
  planned: 'Planejada',
  in_progress: 'Em andamento',
  done: 'Concluída',
}
const STATUS_COLORS: Record<string, string> = {
  planned: '#555',
  in_progress: '#d4852a',
  done: '#3ecf8e',
}

export default function FeaturesPanel({
  projectId,
  initialFeatures,
}: {
  projectId: string
  initialFeatures: Feature[]
}) {
  const [features, setFeatures] = useState<Feature[]>(initialFeatures)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  async function addFeature() {
    if (!newName.trim()) return
    setAdding(true)

    const { data, error } = await supabase
      .from('features')
      .insert({ project_id: projectId, name: newName.trim(), status: 'planned', branch: '', notes: '' })
      .select()
      .single()

    if (!error && data) {
      setFeatures(prev => [...prev, data])
      setNewName('')
    }
    setAdding(false)
  }

  async function updateFeature(id: string, field: string, value: string) {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
    await supabase.from('features').update({ [field]: value }).eq('id', id)
  }

  async function deleteFeature(id: string) {
    setFeatures(prev => prev.filter(f => f.id !== id))
    await supabase.from('features').delete().eq('id', id)
  }

  const counts = {
    planned: features.filter(f => f.status === 'planned').length,
    in_progress: features.filter(f => f.status === 'in_progress').length,
    done: features.filter(f => f.status === 'done').length,
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-2xl">
        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {STATUS_OPTIONS.map(s => (
            <div key={s} className="bg-[#141414] border border-[#1e1e1e] rounded-lg px-4 py-2.5">
              <span style={{ color: STATUS_COLORS[s], fontWeight: 500 }}>{counts[s as keyof typeof counts]}</span>
              <span className="text-xs text-[#555] ml-2">{STATUS_LABELS[s]}</span>
            </div>
          ))}
        </div>

        {/* Add feature */}
        <div className="flex gap-2 mb-5">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFeature()}
            placeholder="Nova feature... (ex: Autenticação com JWT)"
            className="flex-1 bg-[#0e0e0e] border border-[#1e1e1e] rounded-lg text-sm text-[#c8c8c8] px-4 py-2.5 outline-none focus:border-[#2a2a2a] placeholder:text-[#333]"
          />
          <button
            onClick={addFeature}
            disabled={adding || !newName.trim()}
            className="px-4 py-2.5 bg-[#1a2a1a] border border-[#3ecf8e44] rounded-lg text-sm text-[#3ecf8e] disabled:opacity-30 whitespace-nowrap"
          >
            + Adicionar
          </button>
        </div>

        {/* Feature list */}
        <div className="space-y-2">
          {features.length === 0 && (
            <p className="text-sm text-[#444] text-center py-8">
              Nenhuma feature adicionada ainda.
            </p>
          )}
          {features.map(feat => (
            <FeatureCard
              key={feat.id}
              feature={feat}
              onUpdate={(field, value) => updateFeature(feat.id, field, value)}
              onDelete={() => deleteFeature(feat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  feature,
  onUpdate,
  onDelete,
}: {
  feature: Feature
  onUpdate: (field: string, value: string) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-[#141414] border border-[#1e1e1e] rounded-lg overflow-hidden"
      style={{ borderLeft: `2px solid ${STATUS_COLORS[feature.status]}` }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: STATUS_COLORS[feature.status] }}
        />
        <span className="flex-1 text-sm text-[#d8d8d8]">{feature.name}</span>
        <select
          value={feature.status}
          onChange={e => { e.stopPropagation(); onUpdate('status', e.target.value) }}
          onClick={e => e.stopPropagation()}
          className="bg-[#0e0e0e] border border-[#252525] rounded text-xs px-2 py-1 outline-none"
          style={{ color: STATUS_COLORS[feature.status] }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="text-[#444] hover:text-[#e05252] transition-colors text-base leading-none ml-1"
        >
          ×
        </button>
        <span className="text-[#444] text-xs">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-[#1e1e1e] pt-3 space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-[#444] mb-1.5">BRANCH</label>
            <input
              value={feature.branch}
              onChange={e => onUpdate('branch', e.target.value)}
              placeholder="feat/nome-da-feature"
              className="w-full bg-[#0e0e0e] border border-[#1e1e1e] rounded-md text-xs text-[#c8c8c8] font-mono px-3 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#444] mb-1.5">NOTAS</label>
            <textarea
              value={feature.notes}
              onChange={e => onUpdate('notes', e.target.value)}
              placeholder="Decisões, blockers, próximos passos..."
              rows={3}
              className="w-full bg-[#0e0e0e] border border-[#1e1e1e] rounded-md text-xs text-[#c8c8c8] px-3 py-2 outline-none resize-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}