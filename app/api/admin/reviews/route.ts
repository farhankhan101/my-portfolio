// app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const createReviewSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  designation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters long'),
  isApproved: z.boolean().default(true),
})

export async function GET() {
  try {
    const reviews = await db.review.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch (error: any) {
    console.error('❌ GET admin/reviews error:', error)
    return NextResponse.json({ error: 'Failed to retrieve reviews.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = createReviewSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, designation, company, rating, comment, isApproved } = result.data

    // Check if review with this email already exists
    const existingReview = await db.review.findUnique({
      where: { email }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'A review with this email address has already been submitted.' },
        { status: 400 }
      )
    }

    const review = await db.review.create({
      data: {
        name,
        email,
        designation,
        company,
        rating,
        comment,
        isApproved,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error('❌ POST admin/reviews error:', error)
    return NextResponse.json({ error: 'Failed to create review.' }, { status: 500 })
  }
}
