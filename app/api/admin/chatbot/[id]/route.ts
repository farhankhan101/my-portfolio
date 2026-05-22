// app/api/admin/chatbot/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getEmbedding } from '@/lib/gemini'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const { question, answer, topic, type } = await req.json()

    const currentEntry = await db.chatKnowledge.findUnique({
      where: { id }
    })

    if (!currentEntry) {
      return NextResponse.json({ error: 'Training entry not found' }, { status: 404 })
    }

    const finalType = type || currentEntry.type
    const finalQuestion = question !== undefined ? question : currentEntry.question
    const finalAnswer = answer !== undefined ? answer : currentEntry.answer
    const finalTopic = topic !== undefined ? topic : currentEntry.topic

    // Generate new embedding
    const textToEmbed = finalType === 'QA' ? `Question: ${finalQuestion}. Answer: ${finalAnswer}` : finalAnswer
    const embedding = await getEmbedding(textToEmbed)
    const vectorString = `[${embedding.join(',')}]`

    // Execute raw SQL update
    await db.$executeRawUnsafe(
      `UPDATE "ChatKnowledge"
       SET 
         type = $1::"KnowledgeType",
         question = $2,
         answer = $3,
         topic = $4,
         embedding = $5::vector,
         "updatedAt" = NOW()
       WHERE id = $6`,
      finalType,
      finalQuestion || null,
      finalAnswer,
      finalTopic || null,
      vectorString,
      id
    )

    const updatedEntry = await db.chatKnowledge.findUnique({
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

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error('❌ PUT admin/chatbot/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update training entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    const currentEntry = await db.chatKnowledge.findUnique({
      where: { id }
    })

    if (!currentEntry) {
      return NextResponse.json({ error: 'Training entry not found' }, { status: 404 })
    }

    await db.chatKnowledge.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Training entry deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE admin/chatbot/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete training entry' }, { status: 500 })
  }
}
