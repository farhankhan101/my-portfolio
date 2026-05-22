// app/api/admin/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projectSchema } from '@/lib/validations'

interface Context {
  params: Promise<{ id: string }>
}

export async function PUT(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const result = projectSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Check if another project uses the same slug
    const currentProject = await db.project.findUnique({
      where: { id }
    })

    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Regenerate slug only if title changes
    let finalSlug = currentProject.slug
    if (result.data.title !== currentProject.title) {
      const slug = result.data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      
      const existingProject = await db.project.findFirst({
        where: { slug, id: { not: id } }
      })
      finalSlug = existingProject ? `${slug}-${Date.now().toString().slice(-4)}` : slug
    }

    const updatedProject = await db.project.update({
      where: { id },
      data: {
        ...result.data,
        slug: finalSlug,
        metrics: result.data.metrics ? JSON.parse(JSON.stringify(result.data.metrics)) : null
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('❌ PUT admin/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params

    const currentProject = await db.project.findUnique({
      where: { id }
    })

    if (!currentProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete corresponding ChatKnowledge entry if it exists
    await db.chatKnowledge.deleteMany({
      where: { id: `project_${id}` }
    })

    await db.project.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Project deleted successfully' })
  } catch (error) {
    console.error('❌ DELETE admin/projects/[id] error:', error)
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
