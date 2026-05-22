// app/admin/projects/page.tsx
'use client'

import { useState, useEffect } from 'react'
import DataTable, { Column } from '@/components/admin/DataTable'
import ProjectForm from '@/components/admin/ProjectForm'
import { Plus, Edit2, Trash2, Globe } from 'lucide-react'

interface Project {
  id: string
  title: string
  slug: string
  tagline: string
  category: string
  coverImage: string
  featured: boolean
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  sortOrder: number
  liveUrl?: string | null
  githubUrl?: string | null
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  
  // VIEW: 'LIST' or 'FORM'
  const [view, setView] = useState<'LIST' | 'FORM'>('LIST')
  const [editingProject, setEditingProject] = useState<any | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleEditClick = (project: Project) => {
    // Fetch full project details (with description, challenges, solutions, metrics)
    // Actually the initial GET retrieves all fields because we are doing select * in DB,
    // so we can directly pass the project object.
    setEditingProject(project)
    setView('FORM')
  }

  const handleAddClick = () => {
    setEditingProject(null)
    setView('FORM')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also remove its training assets.')) return
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchProjects()
      } else {
        alert('Failed to delete project.')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  const handleFormSubmit = async (values: any) => {
    try {
      let res
      if (editingProject) {
        res = await fetch(`/api/admin/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
      } else {
        res = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
      }

      if (res.ok) {
        setView('LIST')
        fetchProjects()
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save project.')
      }
    } catch (error) {
      console.error('Error saving project:', error)
    }
  }

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (item) => (
        <div>
          <span className="font-bold text-foreground">{item.title}</span>
          <span className="block text-[10px] text-muted-foreground font-medium">/{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
          item.status === 'PUBLISHED'
            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
            : item.status === 'DRAFT'
            ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-550/15'
            : 'bg-secondary text-muted-foreground border border-border'
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'featured',
      header: 'Featured',
      render: (item) => (
        <span className="text-xs font-semibold">
          {item.featured ? '⭐️ Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Sort Order',
    },
    {
      key: 'links',
      header: 'Links',
      render: (item) => (
        <div className="flex gap-2">
          {item.liveUrl && (
            <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-sky-600 dark:hover:text-sky-400 text-muted-foreground" title="Live Site">
              <Globe size={14} />
            </a>
          )}
          {item.githubUrl && (
            <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:text-sky-600 dark:hover:text-sky-400 text-muted-foreground flex items-center justify-center" title="GitHub Repo">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          )}
        </div>
      )
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects Showcase</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {view === 'LIST' ? 'Manage your developer work portfolio projects.' : 'Fill in the details for this showcase.'}
          </p>
        </div>
        {view === 'LIST' && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-lg"
          >
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {view === 'LIST' ? (
        <DataTable
          columns={columns}
          data={projects}
          searchKey="title"
          searchPlaceholder="Search projects by title..."
          loading={loading}
          emptyMessage="No showcase projects found."
        />
      ) : (
        <ProjectForm
          initialValues={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={() => setView('LIST')}
        />
      )}
    </div>
  )
}
