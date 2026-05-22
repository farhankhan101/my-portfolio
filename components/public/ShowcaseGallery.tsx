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
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIdx === null) return
    setLightboxIdx((prev) => (prev === 0 ? images.length - 1 : prev! - 1))
  }

  const handleNext = (e: React.MouseEvent) => {
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
        <p className="text-xs text-muted-foreground">Click any image to enlarge and view full size.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((url, idx) => (
          <div
            key={idx}
            onClick={() => setLightboxIdx(idx)}
            className="group relative aspect-video rounded-2xl overflow-hidden border border-border bg-secondary hover:border-sky-500/30 transition-all duration-300 shadow-md hover:shadow-lg cursor-zoom-in"
          >
            <Image
              src={url}
              alt={`${projectTitle} screenshot ${idx + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized={url.startsWith('/uploads/')}
            />
            {/* Zoom Badge overlay */}
            <div className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={12} />
            </div>
          </div>
        ))}
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
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
            title="Close Lightbox"
          >
            <X size={24} />
          </button>

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
                title="Previous Image"
              >
                <ChevronLeft size={30} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-6 p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer z-50"
                title="Next Image"
              >
                <ChevronRight size={30} />
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
