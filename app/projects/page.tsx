// app/projects/page.tsx
import { db } from '@/lib/db'
import ProjectsList from '@/components/public/ProjectsList'
import Projects3DGrid from '@/components/public/Projects3DGrid'
import Interactive3DShape from '@/components/public/Interactive3DShape'
import { Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Showcase Projects | Farhan Ahmed Portfolio',
  description: 'Explore full stack case studies, web applications, open-source repositories, and system architectures built by Farhan Ahmed.',
}

export const revalidate = 60 // cache for 60 seconds

export default async function ProjectsPage() {
  // Query all published projects
  const projects = await db.project.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      tagline: true,
      category: true,
      coverImage: true,
      featured: true,
      techStack: true,
    },
  })

  return (
    <div className="relative w-full py-32 px-6 overflow-hidden">
      {/* Interactive 3D Grid Wave Background */}
      <div className="absolute inset-0 h-[480px] opacity-75 dark:opacity-50 pointer-events-none z-0">
        <Projects3DGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      {/* Background glow */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Showcase
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Showcase Projects Directory
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              A curated list of SaaS products, multi-tenant databases, API integrations, and developer platforms I've designed and delivered.
            </p>
          </div>
          {/* Rotating 3D Interactive Network shape in Header */}
          <div className="relative w-28 h-28 shrink-0 md:block hidden bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-300/30 dark:border-slate-700/30 rounded-2xl overflow-hidden shadow-none">
            <Interactive3DShape shape="network" />
          </div>
        </div>

        {/* Client-side search and filters list */}
        <ProjectsList initialProjects={projects} />
      </div>
    </div>
  )
}
