// app/api/admin/messages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const { status } = await req.json()

    if (!status || !['UNREAD', 'READ', 'REPLIED', 'ARCHIVED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const message = await db.contactMessage.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('❌ PUT admin/messages/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    await db.contactMessage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE admin/messages/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
