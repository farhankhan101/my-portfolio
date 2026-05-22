// components/admin/ImageUploader.tsx
'use client'

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import MediaSelectorModal from './MediaSelectorModal'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUploader({ value, onChange, label = 'Upload Image' }: ImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleGlobalPaste = async (e: ClipboardEvent) => {
      // Do not paste if the cursor is inside a text input/textarea
      const activeEl = document.activeElement
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      )
      
      if (isTyping) return
      if (!isHovered || isLoading) return

      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            e.preventDefault()
            await uploadFile(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => {
      window.removeEventListener('paste', handleGlobalPaste)
    }
  }, [isHovered, isLoading])

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
      onChange(data.url)
    } catch (err: any) {
      console.error('❌ Error uploading image:', err)
      setError(err?.message || 'Failed to upload image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadFile(e.target.files[0])
    }
  }

  const removeImage = () => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div 
      className="space-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label && <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary/40 aspect-video max-w-md">
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 448px) 100vw, 448px"
            unoptimized={value.startsWith('/uploads/')}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-lg"
            >
              Change Image
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-red-650 hover:bg-red-500 text-white rounded-full transition-colors cursor-pointer shadow-lg"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setIsOpen(true)}
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px] max-w-md ${
            isDragging
              ? 'border-sky-500 bg-sky-500/5'
              : 'border-border bg-secondary/20 hover:bg-secondary/40 hover:border-muted-foreground/30'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center space-y-2 text-sky-500">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-sm font-medium">Uploading image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-card border border-border text-muted-foreground">
                <Upload size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  <span className="text-sky-500 dark:text-sky-400 hover:underline">Click to select image</span>, drag here, or paste (Ctrl+V)
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">Select from library, drag & drop, or hover and paste</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

      <MediaSelectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={(url) => {
          onChange(url)
          setIsOpen(false)
        }}
      />
    </div>
  )
}
