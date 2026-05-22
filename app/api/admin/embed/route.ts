// app/api/admin/embed/route.ts
import { NextResponse } from 'next/server'
import { syncDatabaseToKnowledgeBase } from '@/lib/rag'

export async function POST() {
  try {
    const result = await syncDatabaseToKnowledgeBase()
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully synchronized and embedded ${result.count} knowledge source(s).`,
      })
    } else {
      return NextResponse.json({ error: 'Sync completed with errors.' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ POST admin/embed error:', error)
    return NextResponse.json({ error: 'Failed to synchronize knowledge base.' }, { status: 500 })
  }
}
