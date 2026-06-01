'use client'

import { useState } from 'react'
import { Server, Globe, TrendingUp, Cpu, Database, Palette } from 'lucide-react'
import Interactive3DShape from './Interactive3DShape'

const SERVICES = [
  {
    id: 'saas-arch',
    title: 'Cloud & SaaS Architecture',
    description: 'Designing PostgreSQL databases, Redis layers, and high-performance server APIs using Node.js and Python. Focusing on speed, uptime, and strict data security.',
    icon: Server,
    shape: 'cube' as const,
    label: 'Cloud & SaaS'
  },
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    description: 'Creating responsive, fluid, and custom-styled web apps using Next.js/React. Focused on excellent UX transitions, performance audits, and high search accessibility.',
    icon: Globe,
    shape: 'pyramid' as const,
    label: 'Frontend'
  },
  {
    id: 'systems',
    title: 'Systems Advisory',
    description: 'Guiding architecture audits, Docker deployments, automated CI/CD pipelines, and configuring cloud server security parameters.',
    icon: TrendingUp,
    shape: 'torus' as const,
    label: 'Systems'
  },
  {
    id: 'ai-rag',
    title: 'AI & RAG Solutions',
    description: 'Building custom RAG workflows, vector database embeddings, chatbot integrations, and hooking LLM pipelines into core software models.',
    icon: Cpu,
    shape: 'network' as const,
    label: 'AI & RAG'
  },
  {
    id: 'database',
    title: 'Database & API Tuning',
    description: 'Designing highly optimized SQL schemas, query scaling, custom RESTful/GraphQL interfaces, and iron-clad user authentication flows.',
    icon: Database,
    shape: 'cylinder' as const,
    label: 'Database'
  },
  {
    id: 'design',
    title: 'Premium Interface Design',
    description: 'Fusing modern layouts, color harmony systems, interactive micro-animations, and custom graphics to create top-tier user experiences.',
    icon: Palette,
    shape: 'sphere' as const,
    label: 'UI Design'
  }
]

export default function ServicesExplorer() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeService = SERVICES[activeIndex]

  const ActiveIcon = activeService.icon

  return (
    <div className="space-y-6">
      {/* 1. DESKTOP GRID (visible only on md and up) */}
      <div className="hidden md:grid md:grid-cols-3 gap-8">
        {SERVICES.map((service) => {
          const IconComponent = service.icon
          return (
            <div
              key={service.id}
              className="bg-card border border-border/60 hover:border-sky-500/50 hover:shadow-xl rounded-2xl p-6 transition-all duration-300 space-y-4 relative overflow-hidden group hover:-translate-y-0.5"
            >
              {/* Interactive 3D Canvas */}
              <div className="absolute right-3 top-3 w-16 h-16 opacity-30 group-hover:opacity-55 pointer-events-none transition-all duration-300">
                <Interactive3DShape shape={service.shape} />
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500 relative z-10">
                <IconComponent size={20} />
              </div>
              <h3 className="text-base font-bold text-foreground relative z-10">{service.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold relative z-10">
                {service.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* 2. MOBILE INTERACTIVE EXPLORER (visible only on mobile) */}
      <div className="block md:hidden space-y-5">
        {/* 3x2 Grid of Tabs */}
        <div className="grid grid-cols-3 gap-2.5">
          {SERVICES.map((service, index) => {
            const IconComponent = service.icon
            const isActive = index === activeIndex
            return (
              <button
                key={service.id}
                onClick={() => setActiveIndex(index)}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/10 text-sky-500 border-sky-500/30 shadow-inner scale-[1.02]'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground active:scale-95'
                }`}
              >
                <IconComponent size={18} className={isActive ? 'animate-pulse' : ''} />
                <span className="text-[9px] font-bold tracking-tight">{service.label}</span>
              </button>
            )
          })}
        </div>

        {/* Dynamic Details Card */}
        <div className="relative bg-card/25 dark:bg-card/30 backdrop-blur-md border border-border/60 rounded-2xl p-6 min-h-[190px] flex flex-col justify-between overflow-hidden shadow-md animate-in fade-in duration-300">
          {/* Custom radial hover background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.04),transparent_65%)] pointer-events-none" />

          {/* Interactive 3D Canvas */}
          <div className="absolute right-4 top-4 w-20 h-20 opacity-35 pointer-events-none">
            {/* Re-render the shape dynamically when activeIndex changes */}
            <Interactive3DShape key={activeService.id} shape={activeService.shape} />
          </div>

          <div className="space-y-4 relative z-10 pr-16">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-500">
              <ActiveIcon size={18} />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                {activeService.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                {activeService.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
