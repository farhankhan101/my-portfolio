// app/experience/page.tsx
import { db } from '@/lib/db'
import { Briefcase, Calendar, MapPin, Sparkles, Trophy, Settings } from 'lucide-react'
import Journey3DHelix from '@/components/public/Journey3DHelix'
import Interactive3DShape from '@/components/public/Interactive3DShape'
import Projects3DGrid from '@/components/public/Projects3DGrid'

export const metadata = {
  title: 'Work Experience | Farhan Ahmed Portfolio',
  description: 'Review the professional career history and software engineering timeline of Farhan Ahmed.',
}

export const revalidate = 60 // cache for 60 seconds

export default async function ExperienceTimelinePage() {
  // Query all experiences ordered by sort order
  const experiences = await db.experience.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const formatDateRange = (start: Date, end?: Date | null) => {
    const format = (d: Date) =>
      d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    return `${format(start)} — ${end ? format(end) : 'Present'}`
  }

  return (
    <div className="relative w-full py-32 px-6 overflow-hidden">
      {/* Interactive 3D Grid Wave Background */}
      <div className="absolute inset-0 h-[480px] opacity-75 dark:opacity-50 pointer-events-none z-0">
        <Projects3DGrid />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      </div>

      {/* 3D Rotating Double Helix Background (Visible on all screens) */}
      <div className="absolute -right-16 md:right-4 top-1/4 w-[280px] md:w-[360px] h-[650px] opacity-55 dark:opacity-35 pointer-events-none z-0">
        <Journey3DHelix />
      </div>

      {/* Background glow */}
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} /> Journey
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Professional Experience Timeline
            </h1>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              A chronological timeline of my career roles, technical contributions, and high-impact software projects.
            </p>
          </div>
          {/* Rotating 3D Interactive Torus shape in Header */}
          <div className="relative w-28 h-28 shrink-0 md:block hidden bg-white/10 dark:bg-white/5 backdrop-blur-md border border-slate-300/30 dark:border-slate-700/30 rounded-2xl overflow-hidden shadow-none">
            <Interactive3DShape shape="torus" />
          </div>
        </div>

        {/* Vertical Timeline Container */}
        {experiences.length === 0 ? (
          <p className="text-sm text-muted-foreground py-12 text-center">No experience timeline items listed yet.</p>
        ) : (
          <div className="relative border-l border-border/60 ml-4 md:ml-8 space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-8 md:pl-12 group">
                
                {/* Vertical timeline node */}
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-background border-2 border-border group-hover:border-sky-500 transition-colors" />

                {/* Main Card */}
                <div className="bg-card/25 dark:bg-card/30 backdrop-blur-md p-6 rounded-2xl border border-border/50 hover:border-sky-500/30 transition-all space-y-6 shadow-sm hover:shadow-md">
                  
                  {/* Job metadata header */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border/40">
                    <div>
                      <h3 className="text-base font-extrabold text-foreground group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {exp.role}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-semibold mt-1">
                        {exp.companyUrl ? (
                          <a
                            href={exp.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            {exp.company}
                          </a>
                        ) : (
                          <span>{exp.company}</span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-card/45 border border-border text-[9px] font-bold text-muted-foreground uppercase">
                          {exp.type}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-left md:text-right shrink-0">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <Calendar size={13} className="text-muted-foreground/60" />
                        <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                      </div>
                      <div className="flex items-center md:justify-end gap-1.5 text-[11px] text-muted-foreground/75 font-semibold">
                        <MapPin size={12} className="text-muted-foreground/60" />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bullet points description */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      Core Operations
                    </span>
                    <div
                      className="text-xs text-muted-foreground leading-relaxed space-y-3 markdown-prose font-medium"
                      dangerouslySetInnerHTML={{ __html: exp.description }}
                    />
                  </div>

                  {/* Achievements */}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <div className="space-y-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Trophy size={11} className="text-sky-500 dark:text-sky-455" /> Key Accomplishments
                      </span>
                      <ul className="space-y-2">
                        {exp.achievements.map((ach, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed font-semibold bg-card/45 border border-border/40 p-2.5 rounded-lg"
                          >
                            <span className="text-sky-600 dark:text-sky-400 shrink-0">•</span>
                            <span>{ach}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Technologies Used */}
                  {exp.techStack && exp.techStack.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        <Settings size={11} className="text-sky-550 dark:text-sky-455" /> Core Environment
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {exp.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2.5 py-1 bg-card/45 border border-border/40 rounded text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
