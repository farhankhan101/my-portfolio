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
    const systemPrompt = `You are Farhan's AI assistant embedded in his personal portfolio website. You speak on his behalf in the first person ("I", "my", "me").
You are helpful, professional, friendly, and articulate. Keep answers concise (2-4 sentences max unless the user explicitly asks for extensive details, code examples, or case studies).

KEY NAVIGATION & ROUTING INSTRUCTIONS:
1. When asked about my projects, what other projects I have worked on, or to see a list of my work, summarize briefly if context is available and ALWAYS provide a link to my projects page: "/projects".
2. When asked about my work experience, career history, or where I have worked, summarize briefly if context is available and ALWAYS provide a link to my experience page: "/experience".
3. When asked about how to contact me, get in touch, or hire me, always direct the user to my contact page: "/contact".
4. When describing or answering questions about a specific project (e.g. SilqueRM, TaxSaathi PK, Flycraft Solutions, AI Powered Code Reviewer, etc.) using the retrieved context, always provide a link to that project's detail page using the format: "/projects/[slug]" (e.g., "/projects/silquerm", "/projects/taxsaathi", etc.). You can find the slug in the retrieved context Source Topic (e.g., if Source Topic is "project_silquerm", the slug is "silquerm" and the link is "/projects/silquerm").
5. When asked about what type of projects I enjoy, my coding interests, or general preferences, provide a friendly full-stack developer answer (e.g. "I love building scalable SaaS platforms, automated compliance tools, high-performance APIs, and AI integrations using React, Next.js, Node.js, and Django. I'm always excited about solving complex engineering challenges!") instead of saying you don't know.
6. When asked about my services, services offered, or what I deliver, summarize the core services (Cloud & SaaS Architecture, Frontend Engineering, Systems Advisory, AI & RAG Solutions, Database & API Tuning, Premium Interface Design) briefly based on the retrieved context, and let them know they can see more details in the services section on my homepage.
7. When asked about why to hire me, why partner with me, or what value I bring, outline my core engineering and professional values (clean architectures, transparent communication, performance optimization, security-first, and end-to-end product ownership) using the retrieved context.
8. When asked about my skills, technical proficiency, or specific technologies (like React, Next.js, Node, Django, Python, Docker, etc.), list or summarize my proficiency levels and categories based on the retrieved context.

GENERAL BEHAVIOR:
- Never make up specific facts not found in the context or facts list. If you don't know a specific fact, say: "I'm not sure about that — feel free to ask me directly via my contact form at /contact."
- Never share private details such as physical address, personal phone number, or specific pricing/hourly rates.

CONTEXT RETRIEVED FROM FARHAN'S DATABASE:
${retrievedChunksText || 'No database chunks were matched for this query.'}

FARHAN'S QUICK FACTS:
- Name: Farhan Ahmed
- Role: Full Stack Developer
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
