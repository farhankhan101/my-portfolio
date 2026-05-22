// components/admin/MediaSelectorModal.tsx
'use client'

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Check, Image as ImageIcon, Search } from 'lucide-react'

interface Asset {
  publicId: string
  url: string
  name: string
  bytes: number
  createdAt: string
}

interface MediaSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function MediaSelectorModal({ isOpen, onClose, onSelect }: MediaSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [deviceText, setDeviceText] = useState('Computer')
  
  // Library State
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssetUrl, setSelectedAssetUrl] = useState<string | null>(null)

  // Uploading State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalFileInputRef = useRef<HTMLInputElement>(null)

  // Detect mobile vs computer
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      if (/iPhone|iPad|iPod|Android/i.test(userAgent)) {
        setDeviceText('Phone')
      } else {
        setDeviceText('Computer')
      }
    }
  }, [])

  // Fetch library assets when modal opens
  const fetchAssets = async () => {
    setLoadingAssets(true)
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) {
        const data = await res.json()
        setAssets(data)
      }
    } catch (err) {
      console.error('Error fetching assets:', err)
    } finally {
      setLoadingAssets(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchAssets()
      setSelectedAssetUrl(null)
      setSearchQuery('')
    }
  }, [isOpen])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }

    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload image')
      }

      const data = await response.json()
      onSelect(data.url)
    } catch (err: any) {
      console.error('❌ Error uploading image:', err)
      setError(err?.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModalFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0])
    }
  }

  const handleSelectAsset = () => {
    if (selectedAssetUrl) {
      onSelect(selectedAssetUrl)
    }
  }

  // Filter library assets
  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col transition-all duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Image Media Selector</h3>
            <p className="text-xs text-muted-foreground">Choose an existing media file or upload a new one.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 border-b border-border/60 flex gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Media Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Upload from {deviceText}
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
          
          {/* Tab 1: Library */}
          {activeTab === 'library' && (
            <div className="space-y-4 h-full flex flex-col">
              {/* Search Bar */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assets..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 transition-colors"
                />
              </div>

              {/* Grid Container */}
              <div className="flex-1 min-h-[200px]">
                {loadingAssets ? (
                  <div className="flex flex-col items-center justify-center py-16 text-sky-500">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-semibold text-muted-foreground mt-2">Loading library...</span>
                  </div>
                ) : filteredAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ImageIcon size={28} className="text-muted-foreground/40 mb-1.5" />
                    <span className="text-xs font-semibold">No media files found.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedAssetUrl === asset.url
                      return (
                        <div
                          key={asset.publicId}
                          onClick={() => setSelectedAssetUrl(asset.url)}
                          onDoubleClick={() => {
                            onSelect(asset.url)
                          }}
                          className={`group relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-sky-500 ring-2 ring-sky-500/20'
                              : 'border-border hover:border-muted-foreground/30'
                          }`}
                        >
                          <Image
                            src={asset.url}
                            alt={asset.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 200px"
                            unoptimized={asset.url.startsWith('/uploads/')}
                          />
                          
                          {/* Overlay Name */}
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[9px] text-white truncate font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {asset.name}
                          </div>

                          {/* Checked state overlay */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-sky-500 text-white rounded-full p-0.5 shadow-md">
                              <Check size={10} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Upload */}
          {activeTab === 'upload' && (
            <div className="flex flex-col items-center justify-center h-full py-6">
              <div
                onClick={() => modalFileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-sky-500/40 hover:bg-secondary/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all w-full max-w-lg min-h-[220px]"
              >
                <input
                  type="file"
                  ref={modalFileInputRef}
                  onChange={handleModalFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {isLoading ? (
                  <div className="flex flex-col items-center space-y-2 text-sky-500">
                    <Loader2 className="animate-spin" size={36} />
                    <span className="text-sm font-semibold">Uploading {deviceText.toLowerCase()} file...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="p-4 rounded-full bg-secondary border border-border text-muted-foreground">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Click to upload from {deviceText}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, JPEG or WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Error */}
        {error && <p className="px-6 pb-2 text-xs text-red-400 font-medium text-center">{error}</p>}

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/15 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-lg font-bold text-xs cursor-pointer transition-colors"
          >
            Cancel
          </button>
          {activeTab === 'library' && (
            <button
              type="button"
              onClick={handleSelectAsset}
              disabled={!selectedAssetUrl}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold text-xs cursor-pointer transition-colors shadow-sm"
            >
              Insert Image
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
