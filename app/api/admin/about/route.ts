// app/api/admin/about/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { aboutSchema, siteConfigSchema } from '@/lib/validations'

export async function GET() {
  try {
    const about = await db.about.findFirst()
    const siteConfig = await db.siteConfig.findFirst()
    return NextResponse.json({ about, siteConfig })
  } catch (error) {
    console.error('❌ GET admin/about error:', error)
    return NextResponse.json({ error: 'Failed to retrieve configurations' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { aboutData, siteConfigData } = body

    // 1. Validate About model
    if (aboutData) {
      const parsedAbout = aboutSchema.safeParse(aboutData)
      if (!parsedAbout.success) {
        return NextResponse.json(
          { error: 'About validation failed', details: parsedAbout.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      await db.about.upsert({
        where: { id: 'singleton' },
        update: parsedAbout.data,
        create: { id: 'singleton', ...parsedAbout.data },
      })
    }

    // 2. Validate SiteConfig model
    if (siteConfigData) {
      const parsedConfig = siteConfigSchema.safeParse(siteConfigData)
      if (!parsedConfig.success) {
        return NextResponse.json(
          { error: 'Site Config validation failed', details: parsedConfig.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      await db.siteConfig.upsert({
        where: { id: 'singleton' },
        update: parsedConfig.data,
        create: { id: 'singleton', ...parsedConfig.data },
      })
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' })
  } catch (error) {
    console.error('❌ PUT admin/about error:', error)
    return NextResponse.json({ error: 'Failed to save configurations' }, { status: 500 })
  }
}
