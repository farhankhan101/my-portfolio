// app/admin/media/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Search,
  Upload,
  Copy,
  Check,
  Trash2,
  Loader2,
  FileImage,
  Sparkles
} from 'lucide-react'

interface Asset {
  publicId: string
  url: string
  name: string
  bytes: number
  createdAt: string
}

export default function AdminMedia() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // Uploading state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (error) {
      console.error('Error fetching media assets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const handleCopyLink = (asset: Asset) => {
    // Get full absolute URL if local path
    const absoluteUrl = asset.url.startsWith('/') 
      ? `${window.location.origin}${asset.url}` 
      : asset.url

    navigator.clipboard.writeText(absoluteUrl)
    setCopiedId(asset.publicId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this media asset permanently?')) return
    try {
      const res = await fetch(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchAssets()
      } else {
        alert('Failed to delete asset.')
      }
    } catch (error) {
      console.error('Error deleting asset:', error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true)
      setUploadError(null)

      const formData = new FormData()
      formData.append('file', e.target.files[0])

      try {
        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          fetchAssets()
          if (fileInputRef.current) fileInputRef.current.value = ''
        } else {
          const errorData = await res.json()
          setUploadError(errorData.error || 'Upload failed')
        }
      } catch (err: any) {
        console.error('Upload error:', err)
        setUploadError('Failed to upload image. Please try again.')
      } finally {
        setUploading(false)
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload and copy markdown links of image assets for case studies.</p>
        </div>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-lg disabled:opacity-50"
          >
            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
            Upload Image
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs py-2 px-4 rounded-lg font-medium">
          {uploadError}
        </div>
      )}

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by filename..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-sky-500/50 transition-colors"
        />
      </div>

      {/* Grid Assets */}
      {loading && assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-sky-500">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm font-medium text-muted-foreground mt-2">Loading library files...</span>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground text-center">
          <Sparkles className="animate-pulse text-muted-foreground/40 mb-2" size={36} />
          <span className="text-sm font-medium">No media assets found.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div
              key={asset.publicId}
              className="group bg-card border border-border hover:border-muted-foreground/30 rounded-xl overflow-hidden flex flex-col justify-between transition-all shadow-sm"
            >
              {/* Image Thumbnail */}
              <div className="relative aspect-video bg-secondary border-b border-border flex items-center justify-center overflow-hidden">
                <Image
                  src={asset.url}
                  alt={asset.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                  unoptimized={asset.url.startsWith('/uploads/')} // skip next/image optimization for local uploads folder to avoid missing next.config.js domains issues
                />
              </div>

              {/* Asset Information */}
              <div className="p-4 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-foreground truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                    {formatBytes(asset.bytes)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyLink(asset)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedId === asset.publicId ? (
                      <>
                        <Check size={12} className="text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(asset.publicId)}
                    className="px-2.5 py-1.5 bg-secondary hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-border rounded-lg text-xs transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
