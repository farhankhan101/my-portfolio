// app/api/admin/experience/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { experienceSchema } from '@/lib/validations'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const result = experienceSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const currentExperience = await db.experience.findUnique({
      where: { id }
    })

    if (!currentExperience) {
      return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 })
    }

    const updatedExperience = await db.experience.update({
      where: { id },
      data: result.data
    })

    return NextResponse.json(updatedExperience)
  } catch (error) {
    console.error('❌ PUT admin/experience/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update experience entry' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    const currentExperience = await db.experience.findUnique({
      where: { id }
    })

    if (!currentExperience) {
      return NextResponse.json({ error: 'Experience entry not found' }, { status: 404 })
    }

    // Delete corresponding ChatKnowledge entry if it exists
    await db.chatKnowledge.deleteMany({
      where: { id: `experience_${id}` }
    })

    await db.experience.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Experience entry deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE admin/experience/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete experience entry' }, { status: 500 })
  }
}
