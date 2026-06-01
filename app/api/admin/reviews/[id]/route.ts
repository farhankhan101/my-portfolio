// app/api/admin/reviews/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface Context {
  params: Promise<{ id: string }>
}

import { z } from 'zod'

const updateReviewSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  designation: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters long').optional(),
  isApproved: z.boolean().optional(),
})

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const body = await req.json()

    const result = updateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Check email uniqueness if email is changed
    if (result.data.email) {
      const existingReview = await db.review.findFirst({
        where: {
          email: result.data.email,
          NOT: { id }
        }
      })
      if (existingReview) {
        return NextResponse.json(
          { error: 'A review with this email address already exists.' },
          { status: 400 }
        )
      }
    }

    const updatedReview = await db.review.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json(updatedReview)
  } catch (error: any) {
    console.error('❌ PUT admin/reviews/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update review.' }, { status: 500 })
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
