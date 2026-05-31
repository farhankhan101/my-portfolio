// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const { isApproved } = await req.json()

    if (typeof isApproved !== 'boolean') {
      return NextResponse.json({ error: 'isApproved field must be a boolean.' }, { status: 400 })
    }

    const updatedReview = await db.review.update({
      where: { id },
      data: { isApproved },
    })

    return NextResponse.json(updatedReview)
  } catch (error: any) {
    console.error('❌ PUT admin/reviews/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update review status.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    await db.review.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Review deleted successfully.' })
  } catch (error: any) {
    console.error('❌ DELETE admin/reviews/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete review.' }, { status: 500 })
  }
}
