// app/api/admin/chatbot/refine/route.ts
import { NextResponse } from 'next/server'
import { refineAnswerWithAI } from '@/lib/gemini'

export async function POST(req: Request) {
  try {
    const { question, originalAnswer, instruction } = await req.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }
    if (!instruction) {
      return NextResponse.json({ error: 'Instruction is required' }, { status: 400 })
    }

    const refinedAnswer = await refineAnswerWithAI(question, originalAnswer || '', instruction)

    return NextResponse.json({ success: true, refinedAnswer })
  } catch (error: any) {
    console.error('❌ POST admin/chatbot/refine error:', error)
    return NextResponse.json({ error: 'Failed to refine answer using AI.' }, { status: 500 })
  }
}
