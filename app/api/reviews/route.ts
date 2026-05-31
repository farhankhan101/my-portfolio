// app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { reviewSchema } from '@/lib/validations'

// In-memory rate limiter for review submissions (IP: { count, resetTime })
const reviewRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const LIMIT = 3 // max 3 submissions
const WINDOW = 60 * 60 * 1000 // 1 hour window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const limitInfo = reviewRateLimitMap.get(ip)

  if (!limitInfo) {
    reviewRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return false
  }

  if (now > limitInfo.resetTime) {
    reviewRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return false
  }

  if (limitInfo.count >= LIMIT) {
    return true
  }

  limitInfo.count += 1
  return false
}

// GET: Fetch all approved reviews
export async function GET() {
  try {
    const reviews = await db.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews, { status: 200 })
  } catch (error: any) {
    console.error('❌ GET reviews API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews.' },
      { status: 500 }
    )
  }
}

// POST: Submit a review with email verification check
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again in an hour.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const result = reviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, rating, comment, code } = result.data

    // Check verification code in the database
    const verification = await db.reviewVerification.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code. Please request a new code.' },
        { status: 400 }
      )
    }

    // Save the review in pending status
    const newReview = await db.review.create({
      data: {
        name,
        email,
        rating,
        comment,
        isApproved: false, // requires admin approval
      },
    })

    // Consume the token (delete verification record)
    await db.reviewVerification.delete({
      where: { id: verification.id },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Your review was submitted successfully! It is pending admin approval and will appear on the site soon.',
        id: newReview.id,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('❌ POST review API error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
