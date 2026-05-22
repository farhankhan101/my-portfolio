// app/api/admin/projects/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { projectSchema } from '@/lib/validations'

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('❌ GET admin/projects error:', error)
    return NextResponse.json({ error: 'Failed to retrieve projects' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = projectSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Generate unique slug if not present or automatically from title
    const slug = result.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    
    const existingProject = await db.project.findUnique({
      where: { slug }
    })

    const finalSlug = existingProject ? `${slug}-${Date.now().toString().slice(-4)}` : slug

    const project = await db.project.create({
      data: {
        ...result.data,
        slug: finalSlug,
        metrics: result.data.metrics ? JSON.parse(JSON.stringify(result.data.metrics)) : undefined
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('❌ POST admin/projects error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
