// components/admin/DataTable.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  searchKey?: keyof T
  searchPlaceholder?: string
  loading?: boolean
  emptyMessage?: string
  onReorder?: (newData: T[]) => Promise<void> | void
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No results found.',
  onReorder,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<T[]>(data)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Keep internal state in sync with data prop updates
  useEffect(() => {
    setItems(data)
  }, [data])

  // Client-side search filtering
  const filteredData = items.filter((item) => {
    if (!searchKey || !searchQuery) return true
    const value = item[searchKey]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(searchQuery.toLowerCase())
  })

  const isReorderActive = !!onReorder && !searchQuery

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return
    setDragOverIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updatedItems = [...items]
    const [movedItem] = updatedItems.splice(draggedIndex, 1)
    updatedItems.splice(index, 0, movedItem)

    setItems(updatedItems)
    if (onReorder) {
      onReorder(updatedItems)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updatedItems = [...items]
    const temp = updatedItems[index]
    updatedItems[index] = updatedItems[index - 1]
    updatedItems[index - 1] = temp

    setItems(updatedItems)
    if (onReorder) {
      onReorder(updatedItems)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return
    const updatedItems = [...items]
    const temp = updatedItems[index]
    updatedItems[index] = updatedItems[index + 1]
    updatedItems[index + 1] = temp

    setItems(updatedItems)
    if (onReorder) {
      onReorder(updatedItems)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {searchKey && (
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
          </div>
        )}
        {onReorder && searchQuery && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            ⚠️ Clear search query to reorder items
          </span>
        )}
      </div>

      {/* Grid Container */}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card/45 shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {onReorder && (
                <th className="px-6 py-4 font-medium w-24">
                  Position
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (onReorder ? 1 : 0)} className="px-6 py-12 text-center text-sky-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-medium text-muted-foreground">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onReorder ? 1 : 0)} className="px-6 py-12 text-center text-muted-foreground/60 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  draggable={isReorderActive}
                  onDragOver={(e) => isReorderActive && handleDragOver(e, idx)}
                  onDrop={(e) => isReorderActive && handleDrop(e, idx)}
                  className={`hover:bg-secondary/40 text-foreground transition-all duration-150 ${
                    draggedIndex === idx ? 'opacity-40 bg-secondary/30' : ''
                  } ${
                    dragOverIndex === idx ? 'bg-sky-500/10 border-t-2 border-sky-500' : ''
                  }`}
                >
                  {onReorder && (
                    <td className="px-6 py-4 w-24 align-middle">
                      {!isReorderActive ? (
                        <span className="text-[10px] text-muted-foreground/40 font-semibold">—</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {/* Drag Handle */}
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragEnd={handleDragEnd}
                            className="p-1 hover:text-sky-500 text-muted-foreground/40 cursor-grab active:cursor-grabbing transition-colors"
                            title="Drag to reorder"
                          >
                            <GripVertical size={14} />
                          </div>
                          {/* Up Button */}
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 text-muted-foreground/60 hover:text-sky-500 hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/60 rounded cursor-pointer disabled:cursor-not-allowed transition-all"
                            title="Move Up"
                          >
                            <ChevronUp size={14} />
                          </button>
                          {/* Down Button */}
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === items.length - 1}
                            className="p-1 text-muted-foreground/60 hover:text-sky-500 hover:bg-secondary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/60 rounded cursor-pointer disabled:cursor-not-allowed transition-all"
                            title="Move Down"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 max-w-md truncate">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
