// app/api/admin/skills/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { skillSchema } from '@/lib/validations'

export async function GET() {
  try {
    const skills = await db.skill.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { proficiency: 'desc' }
      ]
    })
    return NextResponse.json(skills)
  } catch (error) {
    console.error('❌ GET admin/skills error:', error)
    return NextResponse.json({ error: 'Failed to retrieve skills list' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = skillSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const skill = await db.skill.create({
      data: result.data
    })

    return NextResponse.json(skill, { status: 201 })
  } catch (error) {
    console.error('❌ POST admin/skills error:', error)
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
  }
}
