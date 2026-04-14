'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

type Project = {
  id: string
  name: string
  type: string
  complexity: string
  stack: string[]
}

type ChatPanelProps = {
  project: Project
  initialMessages: Message[]
}

export default function ChatPanel({ project, initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const stored = localStorage.getItem('mf_api_key')
    if (stored) setApiKey(stored)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    await supabase.from('messages').insert({
      project_id: project.id,
      role: 'user',
      content: text,
    })

    if (!apiKey) {
      const guided = getGuidedReply(text)
      setTimeout(async () => {
        setMessages(prev => [...prev, { role: 'assistant', content: guided }])
        await supabase.from('messages').insert({
          project_id: project.id,
          role: 'assistant',
          content: guided,
        })
        setLoading(false)
      }, 600)
      return
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          projectContext: project,
          apiKey,
        }),
      })

      const data = await res.json()
      const reply = data.reply || 'Erro ao obter resposta.'

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      await supabase.from('messages').insert({
        project_id: project.id,
        role: 'assistant',
        content: reply,
      })
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Erro ao conectar com a API. Verifique sua chave nas configurações.',
      }])
    }

    setLoading(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const suggestions = [
    `Quero começar o projeto "${project.name}". Por onde começo?`,
    'Faça o diagnóstico do meu conhecimento na stack deste projeto',
    'Me ajude a definir o escopo MVP',
    'Qual a primeira feature que devo implementar?',
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-xl">
            <p className="font-mono text-sm text-[#3ecf8e] mb-1">
              Projeto iniciado
            </p>
            <p className="text-sm text-[#555] mb-4">
              {apiKey
                ? 'O mentor está pronto. Como quer começar?'
                : 'Modo guiado ativo. Adicione sua chave Claude nas configurações para ativar o mentor com IA.'}
            </p>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="block w-full text-left px-3 py-2 bg-[#141414] border border-[#1e1e1e] rounded-lg text-xs text-[#666] hover:text-[#c8c8c8] hover:border-[#2a2a2a] transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#1a2a1a] border border-[#3ecf8e44] flex items-center justify-center text-[10px] text-[#3ecf8e] font-mono font-medium flex-shrink-0 mt-0.5">
                M
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#1a2030] border border-[#2a3050] text-[#c8c8e8] rounded-tr-sm'
                  : 'bg-[#141414] border border-[#1e1e1e] text-[#c8c8c8] rounded-tl-sm'
              }`}
            >
              <FormattedContent content={msg.content} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#1a2a1a] border border-[#3ecf8e44] flex items-center justify-center text-[10px] text-[#3ecf8e] font-mono font-medium flex-shrink-0">
              M
            </div>
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1e1e1e] bg-[#141414]">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={
              apiKey
                ? 'Digite sua mensagem... (Enter para enviar)'
                : 'Modo guiado — adicione sua chave Claude nas configurações'
            }
            rows={2}
            className="flex-1 bg-[#0e0e0e] border border-[#1e1e1e] rounded-lg text-sm text-[#c8c8c8] px-4 py-2.5 outline-none resize-none placeholder:text-[#333] focus:border-[#2a2a2a]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-[#1a2a1a] border border-[#3ecf8e44] rounded-lg text-sm text-[#3ecf8e] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#3ecf8e] transition-colors"
          >
            Enviar →
          </button>
        </div>
        <div className="flex items-center mt-2">
          <span className="text-[10px] text-[#333] flex items-center gap-1.5">
            {apiKey
              ? <><span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e] inline-block" /> Modo IA ativo</>
              : <><span className="w-1.5 h-1.5 rounded-full bg-[#d4852a] inline-block" /> Modo guiado</>
            }
          </span>
        </div>
      </div>
    </div>
  )
}

function FormattedContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith('```')) {
          const lines = part.slice(3, -3).split('\n')
          const code = lines.slice(1).join('\n')
          return (
            <pre key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-md p-3 mt-2 mb-2 text-xs font-mono overflow-x-auto">
              <code className="text-[#a8d8a8]">{code}</code>
            </pre>
          )
        }
        return <span key={i} className="whitespace-pre-wrap">{part}</span>
      })}
    </div>
  )
}

function getGuidedReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('começar') || t.includes('por onde')) {
    return `Vamos começar!\n\nPrimeiro, acesse a aba **Perfil** e defina seu nível em cada tecnologia da stack deste projeto.\n\nDepois volte aqui e me diga: o projeto já tem repositório criado no GitHub?\n\n> 💡 *Adicione sua chave Claude nas configurações para ativar o mentor com IA real.*`
  }
  if (t.includes('diagnóstico') || t.includes('perfil')) {
    return `Para o diagnóstico, acesse a aba **Perfil** e defina seu nível em cada tecnologia:\n\n- **Nunca usei** → explicação do zero\n- **Já vi** → conceito + prática guiada\n- **Uso com ajuda** → dicas antes de mostrar solução\n- **Uso com confiança** → direto ao ponto`
  }
  if (t.includes('mvp') || t.includes('escopo')) {
    return `Para definir o MVP, responda:\n\n1. Qual é o problema central que este projeto resolve?\n2. Quem vai usar?\n3. O que é indispensável para funcionar minimamente?\n\n> 💡 *Com a chave Claude configurada, receba análise personalizada do escopo.*`
  }
  return `Recebi sua mensagem.\n\nPara respostas personalizadas do mentor com IA, adicione sua chave Claude nas **Configurações**.\n\nNo modo guiado posso ajudar com:\n- Definir escopo → *"me ajude a definir o MVP"*\n- Diagnóstico → *"faça meu diagnóstico"*\n- Planejar features → *"qual a primeira feature?"*`
}