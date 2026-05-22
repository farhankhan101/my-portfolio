// app/api/admin/skills/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { skillSchema } from '@/lib/validations'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const result = skillSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const currentSkill = await db.skill.findUnique({
      where: { id }
    })

    if (!currentSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    const updatedSkill = await db.skill.update({
      where: { id },
      data: result.data
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error('❌ PUT admin/skills/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    const currentSkill = await db.skill.findUnique({
      where: { id }
    })

    if (!currentSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
    }

    await db.skill.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Skill deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE admin/skills/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
  }
}
