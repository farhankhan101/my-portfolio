// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path'

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes('yourCloudName')

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

// Ensure local uploads directory exists
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true })
}

export interface UploadedAsset {
  publicId: string
  url: string
  name: string
  bytes: number
  createdAt: string
}

/**
 * Uploads a base64 encoded string or file buffer to Cloudinary (or local storage fallback)
 */
export async function uploadAsset(
  fileBuffer: Buffer, 
  fileName: string | null | undefined, 
  mimeType: string
): Promise<UploadedAsset> {
  const safeFileName = fileName || 'pasted_image.png'
  const fileExtension = path.extname(safeFileName) || `.${mimeType ? mimeType.split('/')[1] : 'png'}`
  const sanitizedBaseName = path.basename(safeFileName, fileExtension).replace(/[^a-zA-Z0-9]/g, '_') || 'uploaded_image'
  const newFileName = `${sanitizedBaseName}_${Date.now()}${fileExtension}`

  if (isCloudinaryConfigured) {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'portfolio',
            filename_override: sanitizedBaseName,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error || !result) {
              return reject(error || new Error('Upload returned empty result'))
            }
            resolve({
              publicId: result.public_id,
              url: result.secure_url,
              name: result.original_filename || newFileName,
              bytes: result.bytes,
              createdAt: result.created_at,
            })
          }
        )
        uploadStream.end(fileBuffer)
      })
    } catch (error) {
      console.error('❌ Cloudinary upload failed, falling back to local storage:', error)
    }
  }

  // Local storage fallback
  const filePath = path.join(LOCAL_UPLOAD_DIR, newFileName)
  await fs.promises.writeFile(filePath, fileBuffer)
  
  const stats = fs.statSync(filePath)
  return {
    publicId: `local_${newFileName}`,
    url: `/uploads/${newFileName}`,
    name: newFileName,
    bytes: stats.size,
    createdAt: stats.birthtime.toISOString(),
  }
}

/**
 * Deletes an asset by public ID from Cloudinary or local fallback
 */
export async function deleteAsset(publicId: string): Promise<boolean> {
  if (publicId.startsWith('local_')) {
    try {
      const fileName = publicId.replace('local_', '')
      const filePath = path.join(LOCAL_UPLOAD_DIR, fileName)
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath)
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Error deleting local file:', error)
      return false
    }
  }

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok'
    } catch (error) {
      console.error('❌ Error deleting Cloudinary asset:', error)
      return false
    }
  }

  return false
}

/**
 * Lists all assets from Cloudinary or local folder
 */
export async function listAssets(): Promise<UploadedAsset[]> {
  const assets: UploadedAsset[] = []

  // 1. Load local files
  try {
    const files = await fs.promises.readdir(LOCAL_UPLOAD_DIR)
    for (const file of files) {
      if (file.startsWith('.')) continue // skip hidden files
      const filePath = path.join(LOCAL_UPLOAD_DIR, file)
      const stats = fs.statSync(filePath)
      assets.push({
        publicId: `local_${file}`,
        url: `/uploads/${file}`,
        name: file,
        bytes: stats.size,
        createdAt: stats.birthtime.toISOString(),
      })
    }
  } catch (error) {
    console.error('❌ Error listing local files:', error)
  }

  // 2. Load from Cloudinary if configured
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'portfolio/',
        max_results: 100,
      })
      const cloudinaryAssets = result.resources.map((item: any) => ({
        publicId: item.public_id,
        url: item.secure_url,
        name: item.filename || path.basename(item.secure_url),
        bytes: item.bytes,
        createdAt: item.created_at,
      }))
      assets.push(...cloudinaryAssets)
    } catch (error) {
      console.error('❌ Error listing Cloudinary files:', error)
    }
  }

  // Sort by date descending
  return assets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
