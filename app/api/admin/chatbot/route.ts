// app/api/admin/chatbot/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEmbedding } from '@/lib/gemini'
import crypto from 'crypto'

export async function GET() {
  try {
    const entries = await db.chatKnowledge.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        type: true,
        question: true,
        answer: true,
        topic: true,
        createdAt: true,
        updatedAt: true,
        // Omit the binary/unsupported embedding field from GET to keep payload clean
      }
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('❌ GET admin/chatbot error:', error)
    return NextResponse.json({ error: 'Failed to retrieve training entries' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { type, question, answer, topic } = await req.json()

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 })
    }

    if (type === 'QA' && (!question || typeof question !== 'string')) {
      return NextResponse.json({ error: 'Question is required for Q&A type' }, { status: 400 })
    }

    const id = crypto.randomUUID()
    
    // Generate text content to embed
    const textToEmbed = type === 'QA' ? `Question: ${question}. Answer: ${answer}` : answer
    const embedding = await getEmbedding(textToEmbed)
    const vectorString = `[${embedding.join(',')}]`

    // Execute raw SQL to insert pgvector
    await db.$executeRawUnsafe(
      `INSERT INTO "ChatKnowledge" (id, type, question, answer, topic, embedding, "createdAt", "updatedAt")
       VALUES ($1, $2::"KnowledgeType", $3, $4, $5, $6::vector, NOW(), NOW())`,
      id,
      type || 'QA',
      question || null,
      answer,
      topic || null,
      vectorString
    )

    // Retrieve the newly created entry to return it
    const newEntry = await db.chatKnowledge.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        question: true,
        answer: true,
        topic: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error: any) {
    console.error('❌ POST admin/chatbot error:', error)
    return NextResponse.json({ error: 'Failed to create training entry' }, { status: 500 })
  }
}
