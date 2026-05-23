'use client'

import Image from 'next/image'
import { MapPin, Briefcase, FileText, CheckCircle2, User, Sparkles, ArrowUpRight } from 'lucide-react'

interface AboutData {
  bio: string
  bioShort: string
  avatarUrl: string
  resumeUrl?: string | null
  availableFor: string[]
  location: string
  headline: string
}

interface AboutSectionProps {
  about: AboutData | null
}

export default function AboutSection({ about }: AboutSectionProps) {
  if (!about) return null

  // Fallback avatar if database seeded one doesn't load
  const avatarImage = about.avatarUrl || '/assets/avatar.jpg'

  return (
    <section className="py-24 px-6 border-b border-border/50 bg-secondary/5 relative z-10">
      {/* Background soft grids */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.04),transparent_50%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center md:text-left space-y-3 mb-16">
          <span className="inline-flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
            <User size={14} /> Profile
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            About My Engineering Journey
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl font-medium">
            Get to know the architect behind the solutions. Combining scalable backend systems with fluid, interactive frontend apps.
          </p>
        </div>

        {/* Sticky Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start relative">
          
          {/* LEFT SIDE: Sticky Profile Card */}
          <div className="md:col-span-5 md:sticky md:top-28 space-y-6">
            <div className="relative group">
              {/* Animated outer glowing boundary */}
              <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-sky-500 to-indigo-500 opacity-25 blur-lg group-hover:opacity-40 transition duration-500" />
              
              {/* Inner glass box */}
              <div className="relative p-4 rounded-[2.5rem] border border-border/60 bg-card shadow-xl overflow-hidden flex flex-col items-center text-center">
                
                {/* Profile Image container */}
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-[2rem] overflow-hidden border border-border shadow-inner bg-secondary mb-5">
                  <Image
                    src={avatarImage}
                    alt="Farhan Ahmed profile"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 176px, 192px"
                    unoptimized
                  />
                </div>

                {/* Info Badges */}
                <div className="w-full space-y-3.5 pt-2">
                  <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground font-semibold">
                    <MapPin size={15} className="text-sky-500 shrink-0" />
                    <span>{about.location}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2.5 text-xs text-muted-foreground font-semibold">
                    <Briefcase size={15} className="text-indigo-500 shrink-0" />
                    <span className="capitalize">{about.availableFor.join(' / ')}</span>
                  </div>

                  <div className="pt-4 flex items-center justify-center gap-3">
                    <a
                      href={about.resumeUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg transition-all border border-sky-500/20"
                    >
                      <FileText size={13} />
                      <span>Download Resume</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Scrollable Detailed Description Blocks */}
          <div className="md:col-span-7 space-y-8">
            
            {/* Block 1: Bio */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-sky-500/30 transition-all space-y-4">
              <div className="flex items-center gap-2 text-sky-500">
                <Sparkles size={18} />
                <h3 className="text-base font-bold text-foreground">Who I Am</h3>
              </div>
              <div 
                className="text-sm text-muted-foreground leading-relaxed font-medium space-y-4"
                dangerouslySetInnerHTML={{ __html: about.bio }}
              />
            </div>

            {/* Block 2: Work Philosophy */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-indigo-500/30 transition-all space-y-4">
              <div className="flex items-center gap-2 text-indigo-500">
                <CheckCircle2 size={18} />
                <h3 className="text-base font-bold text-foreground">My Work Philosophy</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                I believe that good software is a combination of engineering discipline and user empathy. I focus on key pillars to deliver maximum value:
              </p>
              <ul className="space-y-3.5 pt-2">
                {[
                  {
                    title: 'Clean Architectures',
                    desc: 'Writing structured, robust, and clean code that is easy to scale, maintain, and audit.'
                  },
                  {
                    title: 'Performance & Optimization',
                    desc: 'Fine-tuning database queries, reducing asset bundles, and leveraging caching networks for millisecond load times.'
                  },
                  {
                    title: 'Security-First Development',
                    desc: 'Enforcing strict server sanitizations, secure storage patterns, and strict user authenticator scopes.'
                  }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Block 3: Value Proposition */}
            <div className="p-6 md:p-8 bg-card border border-border/60 rounded-2xl shadow-sm hover:border-cyan-500/30 transition-all space-y-4">
              <div className="flex items-center gap-2 text-cyan-500">
                <Sparkles size={18} />
                <h3 className="text-base font-bold text-foreground">Why Partner With Me?</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                With 5+ years of software engineering expertise leading development in SaaS setups, I deliver not just code, but total product ownership:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/40">
                  <h4 className="text-xs font-bold text-foreground">100% Transparency</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">Detailed tracking, regular build releases, and clear scope agreements.</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-xl border border-border/40">
                  <h4 className="text-xs font-bold text-foreground">Production-Ready</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">Automated CI/CD deployments, zero-downtime release schemes, and secure Docker configs.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
