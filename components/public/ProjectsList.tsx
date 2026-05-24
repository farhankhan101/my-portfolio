// components/public/ProjectsList.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Sparkles, ArrowRight } from 'lucide-react'

interface Project {
  id: string
  title: string
  slug: string
  tagline: string
  category: string
  coverImage: string
  featured: boolean
  techStack: string[]
}

interface ProjectsListProps {
  initialProjects: Project[]
}

const CATEGORIES = ['All', 'SaaS', 'Web Applications', 'Chatbots', 'AI Agents', 'Open Source']

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredProjects = initialProjects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      activeCategory === 'All' ||
      project.category.toLowerCase() === activeCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Categories Chips */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                  : 'bg-card/25 dark:bg-card/30 backdrop-blur-sm text-muted-foreground border-border hover:bg-secondary/60 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or tech..."
            className="w-full pl-9 pr-4 py-2 bg-card/25 dark:bg-card/30 backdrop-blur-md border border-border rounded-full text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-sky-500/50 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Grid Display */}
      {filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-muted-foreground text-center font-medium">
          <Sparkles className="animate-pulse text-muted-foreground/40 mb-2" size={32} />
          <p className="text-sm">No portfolio items found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-card/25 dark:bg-card/30 backdrop-blur-md border border-border/50 hover:border-sky-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
            >
              {/* Cover Image */}
              <div className="relative aspect-video bg-secondary/30 overflow-hidden border-b border-border/40">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 30vw"
                  unoptimized={project.coverImage.startsWith('/uploads/')}
                />
                {project.featured && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-sky-600 text-[9px] font-extrabold text-white uppercase tracking-wider shadow-md">
                    Featured
                  </div>
                )}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-background/95 border border-border/40 text-[10px] font-bold text-sky-500 dark:text-sky-400">
                  {project.category}
                </div>
              </div>

              {/* Core Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-normal line-clamp-2 font-medium">
                    {project.tagline}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                  <div className="flex gap-1.5 flex-wrap">
                    {project.techStack.slice(0, 3).map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-card/45 border border-border/40 rounded text-[9px] font-bold text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Read Case Study"
                  >
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
