// app/api/admin/messages/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const messages = await db.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(messages)
  } catch (error) {
    console.error('❌ GET admin/messages error:', error)
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 })
  }
}
