// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendContactEmail } from '@/lib/resend'
import { contactSchema } from '@/lib/validations'
import { uploadAsset } from '@/lib/cloudinary'

// In-memory rate limiter (stores IP: { count, resetTime })
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const LIMIT = 3 // max submissions
const WINDOW = 60 * 60 * 1000 // 1 hour window

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const limitInfo = rateLimitMap.get(ip)

  if (!limitInfo) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
    return false
  }

  if (now > limitInfo.resetTime) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW })
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
    // 1. Get client IP
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'

    // 2. Apply rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in an hour.' },
        { status: 429 }
      )
    }

    // 3. Parse and validate body
    const body = await req.json()
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, email, subject, message, phone, attachmentName, attachmentData } = result.data

    // Upload attachment to Cloudinary or local fallback if provided
    let attachmentUrl = null
    if (attachmentName && attachmentData) {
      try {
        const fileBuffer = Buffer.from(attachmentData, 'base64')
        const ext = attachmentName.split('.').pop() || 'png'
        const mimeType = `application/${ext}`
        const uploaded = await uploadAsset(fileBuffer, attachmentName, mimeType)
        attachmentUrl = uploaded.url
      } catch (err) {
        console.error('❌ Failed to upload attachment:', err)
      }
    }

    // 4. Save to DB (append phone & file details in message text to avoid changing DB schema)
    let formattedMessage = message
    if (phone) {
      formattedMessage += `\n\n[Contact Number: ${phone}]`
    }
    if (attachmentName) {
      if (attachmentUrl) {
        formattedMessage += `\n[Attachment: ${attachmentName}](${attachmentUrl})`
      } else {
        formattedMessage += `\n[Attached File: ${attachmentName}]`
      }
    }

    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message: formattedMessage,
        status: 'UNREAD',
      },
    })

    // 5. Send emails via Resend (with optional base64 attachment support)
    await sendContactEmail({
      name,
      email,
      subject,
      message,
      phone,
      attachmentName,
      attachmentData
    })

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! I've received your message and will reply within 24 hours.",
        id: contactMessage.id,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('❌ Contact submission API error:', error)
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
