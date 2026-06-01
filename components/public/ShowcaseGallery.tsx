// components/public/ShowcaseGallery.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface ShowcaseGalleryProps {
  images: string[]
  projectTitle: string
}

export default function ShowcaseGallery({ images, projectTitle }: ShowcaseGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const handlePrevActive = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextActive = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIdx === null) return
    setLightboxIdx((prev) => (prev === 0 ? images.length - 1 : prev! - 1))
  }

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIdx === null) return
    setLightboxIdx((prev) => (prev === images.length - 1 ? 0 : prev! + 1))
  }

  return (
    <div className="border-t border-border/60 pt-12 space-y-6">
      <div className="space-y-1">
        <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
          📸 Media Gallery
        </span>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Project Visuals & Showcase
        </h2>
        <p className="text-xs text-muted-foreground">Click the main image to view in fullscreen lightbox.</p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Main Showcase Viewport */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border bg-secondary shadow-lg group">
          <Image
            src={images[activeIdx]}
            alt={`${projectTitle} showcase ${activeIdx + 1}`}
            fill
            className="object-cover cursor-zoom-in transition-all duration-300"
            sizes="(max-width: 1024px) 100vw, 896px"
            unoptimized={images[activeIdx].startsWith('/uploads/')}
            onClick={() => setLightboxIdx(activeIdx)}
          />

          {/* Navigation Controls inside Main Viewport */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevActive}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Previous Image"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNextActive}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                title="Next Image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Zoom Overlay indicator */}
          <div
            onClick={() => setLightboxIdx(activeIdx)}
            className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
          >
            <ZoomIn size={12} />
            <span>Enlarge</span>
          </div>

          {/* Image index badge */}
          <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-white text-[10px] font-bold">
            {activeIdx + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Navigation Strip */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
            {images.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative aspect-video w-24 sm:w-32 rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 transition-all duration-200 ${
                  activeIdx === idx
                    ? 'border-sky-500 ring-2 ring-sky-500/20 scale-[0.98]'
                    : 'border-border/60 opacity-60 hover:opacity-100'
                }`}
              >
                <Image
                  src={url}
                  alt={`${projectTitle} thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="128px"
                  unoptimized={url.startsWith('/uploads/')}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && (
        <div
          onClick={() => setLightboxIdx(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
            title="Close Lightbox"
          >
            <X size={24} />
          </button>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevLightbox}
                className="absolute left-2 md:left-6 p-2 md:p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
                title="Previous Image"
              >
                <ChevronLeft size={24} className="md:w-[30px] md:h-[30px]" />
              </button>
              <button
                onClick={handleNextLightbox}
                className="absolute right-2 md:right-6 p-2 md:p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
                title="Next Image"
              >
                <ChevronRight size={24} className="md:w-[30px] md:h-[30px]" />
              </button>
            </>
          )}

          {/* Large Image View */}
          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center">
            <Image
              src={images[lightboxIdx]}
              alt={`${projectTitle} fullscreen view`}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized={images[lightboxIdx].startsWith('/uploads/')}
            />
          </div>

          {/* Image Index indicator */}
          <div className="mt-4 px-4 py-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold rounded-full">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
