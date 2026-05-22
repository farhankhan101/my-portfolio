// app/admin/skills/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, Sparkles } from 'lucide-react'

interface Skill {
  id: string
  name: string
  category: 'Frontend' | 'Backend' | 'DevOps' | 'Tools'
  iconSlug: string
  proficiency: number
  sortOrder: number
}

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Tools'] as const

export default function AdminSkills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('Frontend')

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<'Frontend' | 'Backend' | 'DevOps' | 'Tools'>('Frontend')
  const [iconSlug, setIconSlug] = useState('')
  const [proficiency, setProficiency] = useState(85)
  const [sortOrder, setSortOrder] = useState(0)
  const [formLoading, setFormLoading] = useState(false)

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/skills')
      if (res.ok) {
        const data = await res.json()
        setSkills(data)
      }
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setName(skill.name)
    setCategory(skill.category)
    setIconSlug(skill.iconSlug)
    setProficiency(skill.proficiency)
    setSortOrder(skill.sortOrder)
  }

  const handleCancel = () => {
    setEditingId(null)
    setName('')
    setCategory('Frontend')
    setIconSlug('')
    setProficiency(85)
    setSortOrder(0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return
    try {
      const res = await fetch(`/api/admin/skills/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchSkills()
        if (editingId === id) {
          handleCancel()
        }
      }
    } catch (error) {
      console.error('Error deleting skill:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !iconSlug.trim()) return

    setFormLoading(true)
    const payload = { name, category, iconSlug, proficiency, sortOrder }

    try {
      let res
      if (editingId) {
        res = await fetch(`/api/admin/skills/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        handleCancel()
        fetchSkills()
      } else {
        alert('Failed to save skill details')
      }
    } catch (error) {
      console.error('Error saving skill:', error)
    } finally {
      setFormLoading(false)
    }
  }

  const filteredSkills = skills.filter((s) => s.category === activeTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Professional Skills</h1>
        <p className="text-sm text-muted-foreground mt-1 font-semibold">Configure proficiency bars and tech tags shown on your frontend.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Create / Edit Form (4 cols) */}
        <div className="lg:col-span-4 bg-card p-6 rounded-xl border border-border h-fit space-y-4 shadow-sm">
          <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            {editingId ? 'Edit Skill Profile' : 'Add New Skill'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Skill Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Next.js"
                required
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm font-bold transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Icon Slug (Devicons) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Devicon Icon Slug</label>
              <input
                type="text"
                value={iconSlug}
                onChange={(e) => setIconSlug(e.target.value)}
                placeholder="e.g. react or nodejs"
                required
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm font-semibold placeholder:text-muted-foreground/60 transition-all"
              />
              <p className="text-[10px] text-muted-foreground leading-normal font-semibold">
                Matches devicon classnames (e.g. <a href="https://devicon.dev" target="_blank" className="text-sky-500 hover:underline">devicon-react-original</a>).
              </p>
            </div>

            {/* Proficiency slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Proficiency</span>
                <span className="text-sky-600 dark:text-sky-400 font-bold">{proficiency}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={proficiency}
                onChange={(e) => setProficiency(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer bg-secondary h-1.5 rounded-lg appearance-none"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:border-sky-500/50 text-sm font-semibold transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-bold text-xs border border-border cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
              >
                {formLoading ? <Loader2 className="animate-spin" size={14} /> : editingId ? 'Update' : 'Add Skill'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Skill Grid by Tabs (8 cols) */}
        <div className="lg:col-span-8 bg-card p-6 rounded-xl border border-border flex flex-col min-h-[400px] shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-border/40 pb-3 gap-2">
            {CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === tab
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                    : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* List Display */}
          <div className="flex-1 mt-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-sky-500 py-12">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-xs font-semibold text-muted-foreground mt-2">Loading skills list...</span>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                <Sparkles size={32} className="text-muted-foreground/45 animate-pulse mb-2" />
                <span className="text-sm font-semibold">No skills listed in {activeTab} yet.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 bg-secondary/30 border border-border hover:border-sky-500/30 rounded-xl space-y-3 flex flex-col justify-between group transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i className={`devicon-${skill.iconSlug}-plain text-lg text-muted-foreground`} />
                        <span className="text-sm font-bold text-foreground">{skill.name}</span>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 text-muted-foreground hover:text-sky-600 dark:hover:text-sky-400 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Proficiency gauge */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                        <span>Proficiency</span>
                        <span>{skill.proficiency}%</span>
                      </div>
                      <div className="w-full bg-secondary border border-border/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
