// app/api/admin/experience/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { experienceSchema } from '@/lib/validations'

export async function GET() {
  try {
    const experiences = await db.experience.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { startDate: 'desc' }
      ]
    })
    return NextResponse.json(experiences)
  } catch (error) {
    console.error('❌ GET admin/experience error:', error)
    return NextResponse.json({ error: 'Failed to retrieve experience list' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = experienceSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const experience = await db.experience.create({
      data: result.data
    })

    return NextResponse.json(experience, { status: 201 })
  } catch (error) {
    console.error('❌ POST admin/experience error:', error)
    return NextResponse.json({ error: 'Failed to create experience entry' }, { status: 500 })
  }
}
