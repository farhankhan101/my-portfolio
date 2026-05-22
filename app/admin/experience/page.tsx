// app/admin/experience/page.tsx
'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'
import ExperienceForm from '@/components/admin/ExperienceForm'
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react'

interface Experience {
  id: string
  company: string
  companyUrl?: string | null
  logoUrl?: string | null
  role: string
  type: string
  location: string
  startDate: string
  endDate?: string | null
  sortOrder: number
}

export default function AdminExperience() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST')
  const [editingExperience, setEditingExperience] = useState<any | null>(null)

  const fetchExperiences = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/experience')
      if (res.ok) {
        const data = await res.json()
        setExperiences(data)
      }
    } catch (error) {
      console.error('Error loading experience list:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  const handleReorder = async (newOrderedList: Experience[]) => {
    setExperiences(newOrderedList)
    const orders = newOrderedList.map((item, idx) => ({
      id: item.id,
      sortOrder: idx,
    }))

    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'experience',
          orders,
        }),
      })
      if (!res.ok) {
        alert('Failed to save reordered list.')
        fetchExperiences()
      }
    } catch (error) {
      console.error('Error saving reordered experience list:', error)
      fetchExperiences()
    }
  }

  const handleEditClick = (exp: Experience) => {
    setEditingExperience(exp)
    setView('FORM')
  }

  const handleAddClick = () => {
    setEditingExperience(null)
    setView('FORM')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience entry? This will also remove its corresponding vector knowledge.')) return
    try {
      const res = await fetch(`/api/admin/experience/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchExperiences()
      } else {
        alert('Failed to delete experience.')
      }
    } catch (error) {
      console.error('Error deleting experience:', error)
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      let res
      if (editingExperience) {
        res = await fetch(`/api/admin/experience/${editingExperience.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
      } else {
        res = await fetch('/api/admin/experience', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
      }

      if (res.ok) {
        setView('LIST')
        fetchExperiences()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save experience entry.')
      }
    } catch (error) {
      console.error('Error saving experience:', error)
    }
  }

  const formatDateRange = (start: string, end?: string | null) => {
    const format = (dateStr: string) => {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    }
    return `${format(start)} — ${end ? format(end) : 'Present'}`
  }

  const columns: Column<Experience>[] = [
    {
      key: 'company',
      header: 'Company',
      render: (item) => (
        <div>
          {item.companyUrl ? (
            <a
              href={item.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              {item.company}
            </a>
          ) : (
            <span className="font-bold text-foreground">{item.company}</span>
          )}
          <span className="block text-[10px] text-muted-foreground font-semibold">{item.location}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role / Job Position',
    },
    {
      key: 'type',
      header: 'Job Type',
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-secondary border border-border text-muted-foreground">
          {item.type}
        </span>
      ),
    },
    {
      key: 'dates',
      header: 'Employment Dates',
      render: (item) => (
        <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
          <Calendar size={12} className="text-muted-foreground/60" />
          <span>{formatDateRange(item.startDate, item.endDate)}</span>
        </div>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditClick(item)}
            className="p-1.5 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 hover:bg-secondary rounded transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => handleDelete(item.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-secondary rounded transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Work Experience</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === 'LIST' ? 'Manage your corporate full-time, contract, or freelance roles.' : 'Fill in employment details.'}
          </p>
        </div>
        {view === 'LIST' && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-lg"
          >
            <Plus size={16} /> New Experience
          </button>
        )}
      </div>

      {view === 'LIST' ? (
        <DataTable
          columns={columns}
          data={experiences}
          searchKey="company"
          searchPlaceholder="Search experiences by company..."
          loading={loading}
          emptyMessage="No experience entries found."
          onReorder={handleReorder}
        />
      ) : (
        <ExperienceForm
          initialValues={editingExperience}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('LIST')}
        />
      )}
    </div>
  )
}
