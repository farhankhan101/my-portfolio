// app/api/admin/reviews/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
