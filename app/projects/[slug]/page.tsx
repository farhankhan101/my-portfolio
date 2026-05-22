// app/projects/[slug]/page.tsx
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Globe,
  Calendar,
  Layers,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
  ShieldCheck,
  User,
  Users,
  Code
} from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const project = await db.project.findFirst({
    where: { slug, status: 'PUBLISHED' },
    select: { title: true, tagline: true },
  })

  if (!project) return {}

  return {
    title: `${project.title} Case Study | Farhan Ahmed Portfolio`,
    description: project.tagline,
  }
}

export default async function ProjectCaseStudyPage({ params }: PageProps) {
  const { slug } = await params

  // Query project details
  const project = await db.project.findFirst({
    where: { slug },
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="relative w-full py-32 px-6">
      {/* Background glow */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          <span>Back to Projects Directory</span>
        </Link>

        {/* Hero details */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              {project.category}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar size={13} className="text-muted-foreground/60" /> {project.duration || 'Ongoing'}
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              {project.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-3xl">
              {project.tagline}
            </p>
          </div>

          {/* Action buttons (Live site / GitHub) */}
          <div className="flex flex-wrap gap-4 pt-2">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg hover:shadow-sky-550/10"
              >
                <Globe size={14} /> Live Showcase Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary border border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground font-bold rounded-lg text-xs transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>Source Repository</span>
              </a>
            )}
          </div>
        </div>

        {/* Hero Cover Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-secondary">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 896px"
            priority
            unoptimized={project.coverImage.startsWith('/uploads/')}
          />
        </div>

        {/* Project Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Context (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Description */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wider border-l-4 border-sky-500 pl-3">
                Project Overview
              </h2>
              <div
                className="text-sm text-muted-foreground leading-relaxed space-y-4 markdown-prose font-medium"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>

            {/* Challenges */}
            {project.challenge && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider border-l-4 border-amber-500 pl-3">
                  Technical Challenges
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {project.challenge}
                </p>
              </div>
            )}

            {/* Solutions */}
            {project.solution && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-foreground uppercase tracking-wider border-l-4 border-emerald-500 pl-3">
                  Engineering Solutions
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  {project.solution}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-8 bg-card p-6 rounded-2xl border border-border h-fit shadow-sm">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 bg-secondary border border-border/40 rounded text-xs font-semibold text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {project.role && (
              <div className="space-y-1 pb-4 border-b border-border/40">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User size={12} className="text-sky-500" /> My Role
                </span>
                <span className="text-sm font-bold text-foreground block pl-4.5">{project.role}</span>
              </div>
            )}

            {project.client && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={12} className="text-sky-500" /> Client / Organization
                </span>
                <span className="text-sm font-bold text-foreground block pl-4.5">{project.client}</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. RESULTS / METRICS */}
        {Array.isArray(project.metrics) && project.metrics.length > 0 && (
          <div className="border-t border-border/60 pt-12 space-y-6">
            <div className="space-y-1">
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Zap size={14} /> Performance
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Measurable Impact & Wins
              </h2>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {(project.metrics as unknown as { label: string; value: string }[]).map((metric, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-card border border-border/60 hover:border-sky-550/30 rounded-2xl space-y-2 flex flex-col justify-center transition-all shadow-sm"
                >
                  <Award className="text-sky-500 dark:text-sky-400 mb-1" size={20} />
                  <div className="space-y-0.5">
                    <span className="block text-2xl font-extrabold text-foreground tracking-tight">
                      {metric.value}
                    </span>
                    <span className="block text-xs text-muted-foreground font-semibold leading-relaxed">
                      {metric.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="border-t border-border/60 pt-12 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary border border-border hover:border-foreground/20 hover:text-foreground font-bold rounded-lg text-sm text-muted-foreground transition-all cursor-pointer shadow-sm"
          >
            <span>Back to Projects Directory</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
