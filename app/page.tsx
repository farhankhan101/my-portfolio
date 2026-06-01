// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import {
  ArrowRight,
  Code2,
  Calendar,
  Briefcase,
  Layers,
  Sparkles,
  Server,
  Globe,
  Cpu,
  ArrowUpRight,
  TrendingUp,
  Award,
  Database,
  Palette
} from 'lucide-react'

import SkillsShowcase from '@/components/public/SkillsShowcase'
import InteractiveStars from '@/components/public/InteractiveStars'
import TypewriterText from '@/components/public/TypewriterText'
import CounterAnimation from '@/components/public/CounterAnimation'
import HandwrittenName from '@/components/public/HandwrittenName'
import AboutSection from '@/components/public/AboutSection'
import RotatingThreeDSphere from '@/components/public/RotatingThreeDSphere'
import FloatingParticles from '@/components/public/FloatingParticles'
import Interactive3DShape from '@/components/public/Interactive3DShape'
import Projects3DGrid from '@/components/public/Projects3DGrid'
import HomepageReviews from '@/components/public/HomepageReviews'
import ServicesExplorer from '@/components/public/ServicesExplorer'

export const revalidate = 60 // Cache for 60 seconds

export default async function HomePage() {
  // Query DB contents sequentially to prevent Prisma connection pool timeouts on connection_limit=1
  const about = await db.about.findFirst()
  const reviews = await db.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
    take: 6
  })
  const featuredProjects = await db.project.findMany({
    where: { status: 'PUBLISHED', featured: true },
    orderBy: { sortOrder: 'asc' },
    take: 3
  })
  const experiences = await db.experience.findMany({
    orderBy: { sortOrder: 'asc' },
    take: 3
  })
  const skills = await db.skill.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  const totalProjectsCount = await db.project.count({
    where: { status: 'PUBLISHED' }
  })
  const earliestExperience = await db.experience.findFirst({
    orderBy: { startDate: 'asc' }
  })

  // Calculate dynamic stats based on database records
  const currentYear = new Date().getFullYear()
  const yearsExp = earliestExperience 
    ? (currentYear - new Date(earliestExperience.startDate).getFullYear())
    : 5

  const projectsCount = totalProjectsCount
  const linesOfCode = totalProjectsCount > 0 ? `${(totalProjectsCount * 3.5).toFixed(0)}k+` : '0k+'

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    acc[skill.category] = acc[skill.category] || []
    acc[skill.category].push(skill)
    return acc
  }, {} as Record<string, typeof skills>)

  return (
    <div className="relative w-full">
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-6 overflow-hidden">
        {/* Interactive 3D Grid Wave Background */}
        <div className="absolute inset-0 h-[480px] opacity-75 dark:opacity-50 pointer-events-none z-0">
          <Projects3DGrid />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        </div>

        {/* Interactive Stars Canvas (fleeing from cursor) */}
        <InteractiveStars />
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-500/10 dark:bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
          
          {/* Avatar (left) */}
          {about?.avatarUrl && (
            <div className="col-span-1 md:col-span-5 flex justify-center">
              <div className="relative shrink-0 group animate-float">
                {/* Outer soft shadow border */}
                <div className="absolute -inset-1.5 rounded-[2.2rem] bg-gradient-to-tr from-sky-500 to-indigo-500 opacity-40 blur-md group-hover:opacity-60 transition duration-300 animate-pulse" />
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 rounded-[2.2rem] overflow-hidden border border-border bg-card shadow-2xl">
                  <Image
                    src={about.avatarUrl}
                    alt="Farhan Ahmed Avatar"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 256px, 288px"
                    priority
                    unoptimized={about.avatarUrl.startsWith('/uploads/')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text content (right) */}
          <div className="col-span-1 md:col-span-7 space-y-4 text-center md:text-left">
            {/* Availability Badge */}
            {about?.availableFor && about.availableFor.length > 0 && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 dark:bg-sky-500/20 border border-sky-500/20 dark:border-sky-400/20 text-sky-600 dark:text-sky-450 text-xs font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-sky-400 animate-pulse" />
                <span>
                  {about.availableFor[0] === 'Freelance' ? 'Software Engineer' : about.availableFor[0]}
                </span>
              </div>
            )}

            {/* Handwritten Name Signature & Headline - tightly spaced */}
            <div className="space-y-1 md:space-y-2">
              <div className="block">
                <HandwrittenName />
              </div>

              {/* Headline & Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-450 via-indigo-400 to-sky-500 leading-tight">
                {about?.headline || 'Full Stack Developer'}
              </h1>
            </div>

            {/* Rotating Roles & Tagline - tightly spaced */}
            <div className="space-y-3">
              {/* Typewriter rotating roles */}
              <p className="text-base sm:text-lg font-bold text-sky-500 dark:text-sky-400 min-h-[1.75rem]">
                <TypewriterText
                  texts={[
                    'Full Stack Developer',
                    'SaaS Architect',
                    'AI & RAG Specialist',
                    'Frontend Engineer',
                    'Backend Systems Engineer',
                  ]}
                  typeSpeed={55}
                  pauseMs={2000}
                  deleteSpeed={30}
                />
              </p>

              {/* Tagline */}
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl font-medium leading-relaxed">
                {about?.tagline || 'Specializing in building premium SaaS applications, React frameworks, and Django APIs.'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                href="/projects"
                className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg text-sm shadow-xl hover:shadow-sky-550/10 transition-all cursor-pointer"
              >
                <span>View Portfolio Case Studies</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-secondary border border-border hover:border-foreground/20 hover:text-foreground font-bold rounded-lg text-sm text-muted-foreground transition-all cursor-pointer shadow-sm"
              >
                Let's Connect
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="relative py-12 px-6 z-10">
        <div className="max-w-5xl mx-auto backdrop-blur-md bg-card/25 dark:bg-card/15 border border-border/55 p-6 sm:p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] relative overflow-hidden group hover:border-sky-500/20 transition-all duration-300">
          {/* Subtle radial inner glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.03),transparent_70%)] pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center relative z-10">
            {/* Stat 1 */}
            <div className="space-y-1 bg-card/20 dark:bg-transparent p-4 rounded-xl border border-border/40 md:border-none md:p-0">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                  <CounterAnimation to={yearsExp} suffix="+" duration={1600} />
                </h4>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Years Experience</p>
            </div>
            
            {/* Stat 2 */}
            <div className="space-y-1 bg-card/20 dark:bg-transparent p-4 rounded-xl border border-border/40 md:border-none md:p-0">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                  <CounterAnimation to={projectsCount} suffix="+" duration={1800} />
                </h4>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Projects Completed</p>
            </div>
            
            {/* Stat 3 */}
            <div className="space-y-1 bg-card/20 dark:bg-transparent p-4 rounded-xl border border-border/40 md:border-none md:p-0">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                  <CounterAnimation to={100} suffix="%" duration={1400} />
                </h4>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Client Satisfaction</p>
            </div>
            
            {/* Stat 4 */}
            <div className="space-y-1 bg-card/20 dark:bg-transparent p-4 rounded-xl border border-border/40 md:border-none md:p-0">
              <div className="flex items-center gap-1.5 justify-center">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sky-500"></span>
                </span>
                <h4 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-400">
                  {linesOfCode}
                </h4>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Clean Code Lines</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE SERVICES / EXPERTISE SECTION */}
      <section className="py-20 px-6 border-b border-border/50 relative z-10 overflow-hidden">
        {/* Interactive Floating Particles in Background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <FloatingParticles count={30} />
        </div>
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="flex items-center justify-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Cpu size={14} /> Services
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              What I Deliver For Companies
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">
              Fusing engineering principles with intuitive aesthetics to design web systems that scale effortlessly and feel incredibly premium.
            </p>
          </div>

          {/* Grid of expertise */}
          <ServicesExplorer />
        </div>
      </section>

      {/* 4. FEATURED PROJECTS SPOTLIGHT */}
      <section className="py-20 px-6 relative z-10 overflow-hidden">
        {/* Interactive Floating Particles in Background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <FloatingParticles count={25} />
        </div>
        {/* Large Interactive 3D Network in Background */}
        <div className="absolute -right-16 -bottom-16 w-[320px] h-[320px] opacity-15 dark:opacity-10 pointer-events-none md:block hidden">
          <Interactive3DShape shape="network" />
        </div>
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} /> Spotlight
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Featured Case Studies</h2>
            </div>
            <Link
              href="/projects"
              className="flex items-center gap-1 text-sm font-bold text-sky-500 dark:text-sky-400 hover:underline transition-colors"
            >
              All Projects <ArrowRight size={14} />
            </Link>
          </div>

          {/* Grid list */}
          <div className="flex md:grid md:grid-cols-3 overflow-x-auto md:overflow-visible gap-6 md:gap-8 pb-6 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="w-[82vw] sm:w-[50vw] md:w-auto shrink-0 snap-center group bg-card border border-border/60 hover:border-sky-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300 relative"
              >
                {/* Image */}
                <div className="relative aspect-video bg-secondary overflow-hidden border-b border-border/40">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 30vw"
                    unoptimized={project.coverImage.startsWith('/uploads/')}
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-background/90 border border-border/40 text-[10px] font-bold text-sky-500 dark:text-sky-400">
                    {project.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-foreground group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-normal line-clamp-2 font-medium">
                      {project.tagline}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                    <div className="flex gap-1.5 flex-wrap">
                      {project.techStack.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-secondary border border-border/40 rounded text-[9px] font-bold text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                      title="Read Case Study"
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ABOUT ME SECTION (WITH STICKY SIDE PROFILE SCROLL) */}
      <AboutSection about={about} />

      {/* 6. SKILLS SHOWCASE WITH PROGRESS & INTERACTIVE CHART VIEW */}
      <SkillsShowcase initialSkills={skills} />

      {/* 6. CAREER TIMELINE PREVIEW */}
      <section className="relative py-20 px-6 border-t border-border/50 z-10 overflow-hidden">
        {/* Rotating 3D Sphere Background Particle System */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-[380px] h-[380px] opacity-40 dark:opacity-30 pointer-events-none md:block hidden">
          <RotatingThreeDSphere />
        </div>

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Briefcase size={14} /> Career
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Work Experience Timeline</h2>
            </div>
            <Link
              href="/experience"
              className="flex items-center gap-1 text-sm font-bold text-sky-500 dark:text-sky-400 hover:underline transition-colors"
            >
              Full Timeline <ArrowRight size={14} />
            </Link>
          </div>

          {/* Timeline teaser */}
          <div className="relative ml-4 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-sky-500 before:via-indigo-500 before:to-transparent">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-8 group">
                {/* Timeline node */}
                <div className="absolute -left-[4px] top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-sky-500 group-hover:bg-sky-500 group-hover:shadow-[0_0_12px_rgba(14,165,233,0.85)] transition-all duration-300 z-10">
                  <span className="absolute -inset-1 rounded-full bg-sky-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-bold text-foreground text-sm">{exp.role}</span>
                      <span className="text-muted-foreground hidden sm:inline">•</span>
                      <span className="text-sky-600 dark:text-sky-400 font-semibold text-xs sm:text-sm">{exp.company}</span>
                    </div>
                    <span className="text-muted-foreground font-medium text-[10px] sm:text-xs sm:ml-auto bg-secondary/80 border border-border/40 px-2 py-0.5 rounded-full w-fit">
                      {new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      {' — '}
                      {exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'Present'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground leading-normal max-w-3xl font-medium" dangerouslySetInnerHTML={{ __html: exp.description }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. WHY HIRE ME SECTION */}
      <section className="py-20 px-6 border-t border-border/50 bg-secondary/10 relative z-10 overflow-hidden">
        {/* Interactive Floating Particles in Background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
          <FloatingParticles count={30} />
        </div>
        {/* Large Interactive 3D Torus in Background */}
        <div className="absolute -right-16 -top-16 w-[320px] h-[320px] opacity-15 dark:opacity-10 pointer-events-none md:block hidden">
          <Interactive3DShape shape="torus" />
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track-custom {
            display: flex;
            width: max-content;
            animation: marquee 45s linear infinite;
          }
          .marquee-track-custom:hover {
            animation-play-state: paused;
          }
        `}} />
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="flex items-center justify-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Award size={14} /> Excellence
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Why Partner With Me?
            </h2>
          </div>

          {/* Infinite Marquee Wrapper with side blur overlays */}
          <div className="relative w-full overflow-hidden py-4">
            {/* Left blur overlay */}
            <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-20 md:w-44 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
            
            {/* Right blur overlay */}
            <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-20 md:w-44 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

            {/* Scrolling Track */}
            <div className="marquee-track-custom gap-6 flex flex-row">
              {[
                {
                  title: "Clean, Maintainable Architectures",
                  description: "I do not write spaghetti code. Every codebase is structured logically with modular components, separation of concerns, and clean databases, making it simple for internal teams to take over."
                },
                {
                  title: "Transparent Communication",
                  description: "Clear expectation-setting, detailed task trackers, regular video updates, and robust documentation. You will always know the exact state of development at any given hour."
                },
                {
                  title: "Performance & Speed Optimization",
                  description: "Every app is fine-tuned to load in milliseconds. Optimized bundles, advanced caching strategies, and asset compression ensure a lightning-fast experience."
                },
                {
                  title: "Security-First Approach",
                  description: "Strict validation, input sanitization, secure cookie storage, and database encryption. Protecting your user data from vulnerabilities is baked into my workflow."
                },
                {
                  title: "AI & RAG Integration Experience",
                  description: "Integrating advanced AI features, LLM workflows, custom embeddings, vector databases, and semantic search queries directly into your core product."
                },
                {
                  title: "Scalable System Engineering",
                  description: "Designing scalable database schemas, Redis caching layers, and high-performance server APIs built to handle traffic spikes effortlessly."
                },
                {
                  title: "Production-Ready CI/CD & Cloud",
                  description: "Automated deployments, secure environment management, serverless configurations, and robust Docker orchestration for zero-downtime releases."
                },
                {
                  title: "End-to-End Product Ownership",
                  description: "I don't just write code. I help design the product roadmap, optimize user retention flows, and align technical architecture with business strategy."
                },
                // Repeat cards for infinite marquee effect
                {
                  title: "Clean, Maintainable Architectures",
                  description: "I do not write spaghetti code. Every codebase is structured logically with modular components, separation of concerns, and clean databases, making it simple for internal teams to take over."
                },
                {
                  title: "Transparent Communication",
                  description: "Clear expectation-setting, detailed task trackers, regular video updates, and robust documentation. You will always know the exact state of development at any given hour."
                },
                {
                  title: "Performance & Speed Optimization",
                  description: "Every app is fine-tuned to load in milliseconds. Optimized bundles, advanced caching strategies, and asset compression ensure a lightning-fast experience."
                },
                {
                  title: "Security-First Approach",
                  description: "Strict validation, input sanitization, secure cookie storage, and database encryption. Protecting your user data from vulnerabilities is baked into my workflow."
                },
                {
                  title: "AI & RAG Integration Experience",
                  description: "Integrating advanced AI features, LLM workflows, custom embeddings, vector databases, and semantic search queries directly into your core product."
                },
                {
                  title: "Scalable System Engineering",
                  description: "Designing scalable database schemas, Redis caching layers, and high-performance server APIs built to handle traffic spikes effortlessly."
                },
                {
                  title: "Production-Ready CI/CD & Cloud",
                  description: "Automated deployments, secure environment management, serverless configurations, and robust Docker orchestration for zero-downtime releases."
                },
                {
                  title: "End-to-End Product Ownership",
                  description: "I don't just write code. I help design the product roadmap, optimize user retention flows, and align technical architecture with business strategy."
                }
              ].map((reason, idx) => (
                <div 
                  key={idx} 
                  className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 p-6 bg-card border border-border/60 hover:border-sky-500/50 rounded-2xl space-y-3 shadow-sm hover:shadow-lg transition-all select-none"
                >
                  <h3 className="text-sm font-extrabold text-foreground">{reason.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold">{reason.description}</p>
                </div>
              ))}
            </div>
          </div>

          <HomepageReviews initialReviews={reviews} />
        </div>
      </section>
    </div>
  )
}
