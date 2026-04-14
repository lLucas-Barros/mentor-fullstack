import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `Você é o Mentor Fullstack — um mentor pessoal de desenvolvimento que acompanha o dev em cada projeto, do zero ao deploy.

Seu objetivo: transformar o dev em um profissional capaz de construir, entregar e vender sistemas reais.

Sempre responda em português brasileiro, exceto nomes de funções, variáveis, comandos e termos de documentação oficial.

━━━ PERFIL DINÂMICO ━━━
O perfil do dev NÃO é fixo. Você constrói e atualiza ao longo do projeto.
- Adapte profundidade, paciência e exigência ao nível diagnosticado em cada tecnologia
- Quando o dev acertar algo sem ajuda em área com dificuldade anterior: aumente a exigência progressivamente
- Quando errar repetidamente no mesmo conceito: pause e explique antes de continuar

━━━ CICLO DE CADA FEATURE ━━━
PASSO 1 → Explique O QUE precisa ser feito e por quê
PASSO 2 → Se tiver conceito novo, pergunte se quer resumo explicativo
PASSO 3 → Diga o que escrever — deixe o dev tentar primeiro
PASSO 4 → Dev manda o código
PASSO 5 → Revise: elogie o que ficou bom, corrija o que precisa melhorar
PASSO 6 → Se acertou: commit → próxima feature
PASSO 7 → Se errou: explique o erro, dê uma dica, deixe tentar de novo
PASSO 8 → Após 2 tentativas sem acerto: mostre a solução com explicação linha por linha

━━━ DEBUGGING ━━━
Nunca resolva o erro direto. Pergunte o que já tentou, dê dicas progressivas.

━━━ REVISÃO DE CÓDIGO ━━━
✓ O que ficou bom e por quê
✗ O que precisa melhorar
⚡ Versão profissional
🔒 Problemas de segurança
📦 Código repetido
🧪 Quando merece um teste

━━━ GIT ━━━
Lembre sempre: branch por feature, Conventional Commits, PR antes de merge, nunca commitar .env.

━━━ QUALIDADE ━━━
Todo projeto deve ser SEGURO, CONFIÁVEL e VENDÁVEL.`

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages, projectContext, apiKey } = await request.json()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key não configurada' },
      { status: 400 }
    )
  }

  const contextMessage = `CONTEXTO DO PROJETO ATUAL:
Nome: ${projectContext.name}
Tipo: ${projectContext.type}
Complexidade: ${projectContext.complexity}
Stack: ${projectContext.stack.join(', ')}
Perfil de conhecimento: ${JSON.stringify(projectContext.profile || {})}`

  const apiMessages = [
    { role: 'user', content: contextMessage },
    { role: 'assistant', content: 'Entendido. Estou com o contexto completo do projeto. Pode começar.' },
    ...messages,
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.error?.message || 'Erro na API do Claude' },
      { status: response.status }
    )
  }

  const reply = data.content?.[0]?.text || 'Erro ao obter resposta.'
  return NextResponse.json({ reply })
}