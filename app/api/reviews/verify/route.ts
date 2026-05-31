// app/api/reviews/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendVerificationCodeEmail } from '@/lib/resend'
import { z } from 'zod'

const verifyRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

// In-memory rate limiter for verification code requests (IP: { count, resetTime })
const otpRateLimitMap = new Map<string, { count: number; resetTime: number }>()
const LIMIT = 5 // max 5 verification code requests
const WINDOW = 15 * 60 * 1000 // 15 minutes window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const limitInfo = otpRateLimitMap.get(ip)

  if (!limitInfo) {
    otpRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return false
  }

  if (now > limitInfo.resetTime) {
    otpRateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return false
  }

  if (limitInfo.count >= LIMIT) {
    return true
  }

  limitInfo.count += 1
  return false
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many verification code requests. Please try again in 15 minutes.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const result = verifyRequestSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    const { email } = result.data

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`🔑 [OTP Generator] Verification Code for ${email} is: ${code}`)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Remove any previous verification entries for this email to prevent spam and duplicate code matching
    await db.reviewVerification.deleteMany({
      where: { email },
    })

    // Save code to database
    await db.reviewVerification.create({
      data: {
        email,
        code,
        expiresAt,
        verified: false,
      },
    })

    // Send code email
    await sendVerificationCodeEmail({ email, code })

    return NextResponse.json(
      { success: true, message: 'Verification code sent to your email.' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Verification API error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please check your connection.' },
      { status: 500 }
    )
  }
}
