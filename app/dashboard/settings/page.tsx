'use client'

import { useState, useEffect } from 'react'

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('mf_api_key')
    if (stored) setApiKey(stored)
  }, [])

  function save() {
    localStorage.setItem('mf_api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function remove() {
    localStorage.removeItem('mf_api_key')
    setApiKey('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 h-12 border-b border-[#1e1e1e] bg-[#141414] flex-shrink-0">
        <span className="font-mono text-sm font-medium text-[#e8e8e8]">Configurações</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-lg">
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 mb-4">
          <div className="text-sm font-medium text-[#e8e8e8] mb-1">
            Chave de API — Claude (Anthropic)
          </div>
          <p className="text-xs text-[#555] mb-4 leading-relaxed">
            Sua chave fica salva apenas no seu navegador. Nunca é enviada para servidores externos além da API da Anthropic.{' '}
            Obtenha sua chave em <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-[#3ecf8e] hover:underline">console.anthropic.com</a>.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full bg-[#0e0e0e] border border-[#252525] rounded-lg text-sm text-[#c8c8c8] font-mono px-4 py-2.5 outline-none mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              className="px-4 py-2 bg-[#1a2a1a] border border-[#3ecf8e44] rounded-lg text-sm text-[#3ecf8e] hover:border-[#3ecf8e] transition-colors"
            >
              {saved ? '✓ Salvo!' : 'Salvar chave'}
            </button>
            {apiKey && (
              <button
                onClick={remove}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#252525] rounded-lg text-sm text-[#555] hover:text-[#e05252] hover:border-[#e05252] transition-colors"
              >
                Remover
              </button>
            )}
          </div>
          {apiKey && (
            <p className="text-xs text-[#3ecf8e] mt-3">
              Chave configurada — modo IA ativo em todos os projetos
            </p>
          )}
        </div>

        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
          <div className="text-sm font-medium text-[#e8e8e8] mb-1">Sobre o Mentor Fullstack</div>
          <div className="text-xs text-[#555] leading-relaxed">
            Versão 1.0 · Dados salvos no Supabase e localmente no navegador.
          </div>
        </div>
      </div>
    </div>
  )
}