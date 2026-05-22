// components/admin/MultiImageUploader.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import MediaSelectorModal from './MediaSelectorModal'

interface MultiImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
}

export default function MultiImageUploader({ value = [], onChange, label = 'Project Showcase Images' }: MultiImageUploaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === index) return
    setDragOverIdx(index)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIdx) return

    const reordered = [...value]
    const [removed] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, removed)
    onChange(reordered)

    setDraggedIdx(null)
    setDragOverIdx(null)
  }

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSelectImage = (url: string) => {
    onChange([...value, url])
    setIsOpen(false)
  }

  return (
    <div className="space-y-3">
      {label && (
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
          <p className="text-[10px] text-muted-foreground mt-0.5">Drag and drop images in the grid to reorder their layout.</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, idx) => {
          const isDragged = draggedIdx === idx
          const isOver = dragOverIdx === idx
          return (
            <div
              key={`${url}-${idx}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, idx)}
              className={`group relative aspect-video bg-secondary/35 border rounded-xl overflow-hidden shadow-sm transition-all duration-200 cursor-grab active:cursor-grabbing ${
                isDragged ? 'opacity-40 scale-95 border-sky-500' : 'border-border'
              } ${
                isOver ? 'border-sky-500 ring-2 ring-sky-500/10 scale-102 bg-sky-500/5' : ''
              }`}
            >
              <Image
                src={url}
                alt={`Showcase image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 200px"
                unoptimized={url.startsWith('/uploads/')}
              />

              {/* Drag Handle Indicator */}
              <div className="absolute top-1.5 left-1.5 bg-black/60 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={10} />
              </div>

              {/* Remove Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer shadow-md"
                  title="Remove image from gallery"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Add Card Button */}
        <div
          onClick={() => setIsOpen(true)}
          className="border-2 border-dashed border-border hover:border-sky-500/40 hover:bg-secondary/30 rounded-xl aspect-video flex flex-col items-center justify-center cursor-pointer transition-all gap-1.5"
        >
          <div className="p-2 bg-secondary border border-border rounded-lg text-muted-foreground">
            <Plus size={16} />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Add Image</span>
        </div>
      </div>

      <MediaSelectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelectImage}
      />
    </div>
  )
}
