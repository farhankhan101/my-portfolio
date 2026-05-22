// app/api/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { listAssets, uploadAsset, deleteAsset } from '@/lib/cloudinary'

export async function GET() {
  try {
    const assets = await listAssets()
    return NextResponse.json(assets)
  } catch (error) {
    console.error('❌ GET admin/media error:', error)
    return NextResponse.json({ error: 'Failed to retrieve media library' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await uploadAsset(buffer, file.name, file.type)

    return NextResponse.json(asset, { status: 201 })
  } catch (error: any) {
    console.error('❌ POST admin/media error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload media file',
      details: error.message || String(error),
      stack: error.stack
    }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    const success = await deleteAsset(publicId)
    if (success) {
      return NextResponse.json({ success: true, message: 'Asset deleted successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ DELETE admin/media error:', error)
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 })
  }
}
