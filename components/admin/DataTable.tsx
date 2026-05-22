// components/admin/DataTable.tsx
'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'

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
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'Search...',
  loading = false,
  emptyMessage = 'No results found.',
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  // Client-side search filtering
  const filteredData = data.filter((item) => {
    if (!searchKey || !searchQuery) return true
    const value = item[searchKey]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchKey && (
        <div className="relative max-w-sm">
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

      {/* Grid Container */}
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-card/45 shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sky-500">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span className="text-xs font-medium text-muted-foreground">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-muted-foreground/60 font-medium">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-secondary/40 text-foreground transition-colors duration-150"
                >
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
