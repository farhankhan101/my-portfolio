// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateChatStream } from '@/lib/gemini'
import { searchKnowledge } from '@/lib/rag'

// In-memory rate limiter for chat (IP: { count, resetTime })
const chatRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const CHAT_LIMIT = 10 // max requests
const CHAT_WINDOW = 60 * 1000 // 1 minute window

function isChatRateLimited(ip: string): boolean {
  const now = Date.now()
  const limitInfo = chatRateLimitMap.get(ip)

  if (!limitInfo) {
    chatRateLimitMap.set(ip, { count: 1, resetTime: now + CHAT_WINDOW })
    return false
  }

  if (now > limitInfo.resetTime) {
    chatRateLimitMap.set(ip, { count: 1, resetTime: now + CHAT_WINDOW })
    return false
  }

  if (limitInfo.count >= CHAT_LIMIT) {
    return true
  }

  limitInfo.count += 1
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    // Rate limiting
    if (isChatRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a minute before sending another message.' },
        { status: 429 }
      )
    }

    const { message, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // 1. Vector Search for relevant context
    const contextChunks = await searchKnowledge(message, 5)
    
    // 2. Format RAG retrieved context chunks
    const retrievedChunksText = contextChunks
      .map((chunk, idx) => {
        const prefix = chunk.question ? `Q: ${chunk.question}\nA: ` : ''
        return `[Source ${idx + 1} - Topic: ${chunk.topic || 'General'}]\n${prefix}${chunk.answer}`
      })
      .join('\n\n')

    // 3. Assemble full system prompt
    const systemPrompt = `You are Farhan's AI assistant embedded in his personal portfolio website. You speak on his behalf.
You are helpful, professional, friendly, and articulate. Keep answers concise (2-4 sentences max unless the user explicitly asks for extensive details, code examples, or case studies).
Never make up information. If you don't know the answer, say: "I'm not sure about that — feel free to ask Farhan directly via the contact form."
Never share private details such as his physical address, personal phone number, or specific hourly rates/pricing details.
When asked about availability, freelance jobs, or hiring, always direct the user to fill out the contact form.

CONTEXT RETRIEVED FROM FARHAN'S DATABASE:
${retrievedChunksText || 'No database chunks were matched for this query.'}

FARHAN'S QUICK FACTS:
- Name: Farhan Ahmed
- Role: Senior Full Stack Developer
- Location: Karachi, Pakistan
- Company: Silquetech
- Primary Stack: React, Next.js, Vue.js, TypeScript, Django REST Framework, Node.js, PostgreSQL
- Available for: Freelance, Contract, Consulting
- Contact form url: /contact`

    // 4. Generate Gemini streaming response
    // History format expected: Array of { role: 'user' | 'model', parts: string[] }
    const formattedHistory = Array.isArray(history) 
      ? history.map((item: any) => ({
          role: (item.role === 'assistant' ? 'model' : 'user') as 'model' | 'user',
          parts: [item.content || '']
        }))
      : []

    const stream = await generateChatStream(systemPrompt, message, formattedHistory)

    // Return the response stream with standard headers
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error: any) {
    console.error('❌ Chat API stream error:', error)
    return NextResponse.json({ error: 'An error occurred while generating a response.' }, { status: 500 })
  }
}
