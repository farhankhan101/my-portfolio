// app/api/admin/reorder/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, orders } = body // orders: Array<{ id: string, sortOrder: number }>

    if (!type || !orders || !Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Run updates in a Prisma transaction to ensure atomicity
    await db.$transaction(
      orders.map((item) => {
        if (type === 'experience') {
          return db.experience.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        } else if (type === 'project') {
          return db.project.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        } else if (type === 'skill') {
          return db.skill.update({
            where: { id: item.id },
            data: { sortOrder: item.sortOrder },
          })
        }
        throw new Error('Invalid reorder type')
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ POST admin/reorder error:', error)
    return NextResponse.json({ error: 'Failed to reorder items' }, { status: 500 })
  }
}
