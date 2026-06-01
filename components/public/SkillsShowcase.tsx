'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, BarChart2, Code2, Sparkles } from 'lucide-react'
import FloatingParticles from './FloatingParticles'
import Interactive3DShape from './Interactive3DShape'

interface Skill {
  id: string
  name: string
  proficiency: number
  category: string
}

interface SkillsShowcaseProps {
  initialSkills: Skill[]
}

const CATEGORIES = ['All', 'Frontend', 'Backend', 'Tools']

// Elegant inline SVG icons for technology stack
function getTechIcon(name: string) {
  const cleanName = name.toLowerCase()

  if (cleanName.includes('react')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="16" cy="16" r="2" fill="currentColor" />
        <ellipse cx="16" cy="16" rx="5" ry="13" transform="rotate(30 16 16)" />
        <ellipse cx="16" cy="16" rx="5" ry="13" transform="rotate(90 16 16)" />
        <ellipse cx="16" cy="16" rx="5" ry="13" transform="rotate(150 16 16)" />
      </svg>
    )
  }
  if (cleanName.includes('next.js') || cleanName.includes('nextjs')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-foreground" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 0C7.16 0 0 7.16 0 16s7.16 16 16 16 16-7.16 16-16S24.84 0 16 0zm-3 23V9h2.38l6.3 8.35V9h2.32v14h-2.12l-6.56-8.7V23H13z" />
      </svg>
    )
  }
  if (cleanName.includes('typescript') || cleanName.includes('ts')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" viewBox="0 0 32 32" fill="currentColor">
        <path d="M2 2h28v28H2V2z" fill="#3178c6" />
        <path d="M22.5 13.5v2.2h-2.9v8.4h-2.6v-8.4h-2.8v-2.2h8.3zm6.3 5.3c-.2-1.1-.8-1.9-1.8-2.3-1-.4-2-.2-2.7.3-.6.5-.9 1.2-.9 2.1 0 .7.3 1.3.8 1.7.5.4 1.4.7 2.6 1 1.7.4 2.8 1 3.3 1.7.6.7.8 1.6.8 2.7 0 1.5-.6 2.7-1.7 3.5-1.1.8-2.6 1.1-4.5 1-1.8-.2-3.1-1-3.8-2.4l2.1-1.4c.5.9 1.1 1.4 1.9 1.6.8.2 1.6.1 2.2-.2.5-.3.8-.8.8-1.4 0-.5-.2-.9-.6-1.2s-1.2-.6-2.3-.9c-1.7-.4-2.8-1-3.3-1.6-.6-.7-.8-1.5-.8-2.5 0-1.4.6-2.5 1.7-3.2 1.1-.7 2.5-1 4.1-.9 1.5.1 2.7.7 3.4 1.7l-1.9 1.5z" fill="white" />
      </svg>
    )
  }
  if (cleanName.includes('vue')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="none">
        <path d="M16 27L4 6h5.5L16 16.5 22.5 6H28L16 27z" fill="#41B883" />
        <path d="M16 21L7.5 6h4L16 13.5 20.5 6h4L16 21z" fill="#35495E" />
      </svg>
    )
  }
  if (cleanName.includes('tailwind')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 11.5c-3 0-4.5 1.5-4.5 4.5 0 3 1.5 4.5 4.5 4.5 3 0 4.5-1.5 4.5-4.5 0-3-1.5-4.5-4.5-4.5zM7 7c-3 0-4.5 1.5-4.5 4.5 0 3 1.5 4.5 4.5 4.5 3 0 4.5-1.5 4.5-4.5C11.5 8.5 10 7 7 7zm18 9c-3 0-4.5 1.5-4.5 4.5 0 3 1.5 4.5 4.5 4.5 3 0 4.5-1.5 4.5-4.5 0-3-1.5-4.5-4.5-4.5z" />
      </svg>
    )
  }
  if (cleanName.includes('django')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-700" viewBox="0 0 32 32" fill="currentColor">
        <path d="M18.8 8.6h2.2v10.4c0 3.3-2 5.1-5.1 5.1-2.9 0-4.7-1.4-5.1-3.6h2.3c.3 1 1.2 1.6 2.8 1.6 1.8 0 2.9-1 2.9-3.2V8.6zm-8.2 4.9c1 0 1.8.8 1.8 1.8s-.8 1.8-1.8 1.8-1.8-.8-1.8-1.8.8-1.8 1.8-1.8z" />
      </svg>
    )
  }
  if (cleanName.includes('node')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3L5.3 9.2v12.4L16 27.8l10.7-6.2V9.2L16 3zm8.9 17.3l-8.9 5.1-8.9-5.1V9.9l8.9-5.1 8.9 5.1v10.4z" />
        <path d="M16 11.2l-5.3 3.1v3.4L16 14.6l5.3 3.1v-3.4L16 11.2z" />
      </svg>
    )
  }
  if (cleanName.includes('postgres')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 2a14 14 0 100 28 14 14 0 000-28zm0 4.2c2 0 3.6 1.6 3.6 3.6s-1.6 3.6-3.6 3.6-3.6-1.6-3.6-3.6 1.6-3.6 3.6-3.6zm0 19.6c-4.4 0-8.2-2.8-9.4-6.8h18.8c-1.2 4-5 6.8-9.4 6.8z" />
      </svg>
    )
  }
  if (cleanName.includes('python')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8" viewBox="0 0 32 32" fill="currentColor">
        <path d="M15.9 2c-3.9 0-3.7 1.7-3.7 1.7l.1 1.6H16c2.4 0 4.3 1.9 4.3 4.3v3.7h3.7s1.7-.2 1.7 3.7c0 3.9-1.7 3.7-1.7 3.7h-1.6v-3.8c0-2.4-1.9-4.3-4.3-4.3h-3.7V9c0-3.9 3.7-3.7 3.7-3.7h3.8V3.7c0-1.7-1.6-1.7-1.6-1.7H15.9z" fill="#387EB8" />
        <path d="M16.1 30c3.9 0 3.7-1.7 3.7-1.7l-.1-1.6H16c-2.4 0-4.3-1.9-4.3-4.3v-3.7H8s-1.7.2-1.7-3.7c0-3.9 1.7-3.7 1.7-3.7h1.6v3.8c0 2.4 1.9 4.3 4.3 4.3h3.7V23c0 3.9-3.7 3.7-3.7 3.7H10.1v1.6c0 1.7 1.6 1.7 1.6 1.7h4.4z" fill="#FFE052" />
      </svg>
    )
  }
  if (cleanName.includes('redis')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 2L3 8.5v15L16 30l13-6.5v-15L16 2zm0 4.4L24.8 10 16 14.4 7.2 10 16 6.4zm-8.8 8.8l8.8 4.4v8.5l-8.8-4.4v-8.5zm17.6 8.5l-8.8 4.4v-8.5l8.8-4.4v8.5z" />
      </svg>
    )
  }
  if (cleanName.includes('docker')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" viewBox="0 0 32 32" fill="currentColor">
        <path d="M6 14.5h3v-3H6v3zm4.5 0h3v-3h-3v3zm-4.5-4h3v-3H6v3zm4.5 0h3v-3h-3v3zm4.5 4h3v-3h-3v3zm4.5 0h3v-3h-3v3zm-4.5-4h3v-3h-3v3zm4.5 0h3v-3h-3v3zm4.5 4h3v-3h-3v3zm6-5c-.5-1.5-1.8-2.5-3.3-2.5H23v3.5h3c.8 0 1.5.5 1.5 1.2 0 1.2-1 2.2-2.2 2.2H2.2c-.7 0-1.2.5-1.2 1.2v3.6c0 .7.5 1.2 1.2 1.2h27.6c1.8 0 3.2-1.5 3.2-3.2v-2.3c0-2-1-3.6-2.5-4.4z" />
      </svg>
    )
  }
  if (cleanName.includes('git')) {
    return (
      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" viewBox="0 0 32 32" fill="currentColor">
        <path d="M30.2 14.8L17.2 1.8c-.8-.8-2-.8-2.8 0L12.2 4c-.2-.1-.5-.2-.8-.2C9.5 3.8 8 5.3 8 7.2c0 1 .5 1.9 1.1 2.5L4 14.8c-.8.8-.8 2 0 2.8l13 13c.8.8 2 .8 2.8 0l10.4-10.4c.8-.8.8-2 0-2.8zM19.4 25.8c-.5.5-1.4.5-2 0L8 16.4c-.5-.5-.5-1.4 0-2l9.4-9.4c.5-.5 1.4-.5 2 0l9.4 9.4c.5.5.5 1.4 0 2l-9.4 9.4zm-1.4-15c1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8-1.8.8-1.8 1.8.8 1.8 1.8 1.8zm-4.2 8.4c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8zm8.4 0c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8zm-4.2-4.2c-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8-.8-1.8-1.8-1.8z" />
      </svg>
    )
  }

  // Fallback generic code logo
  return (
    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

export default function SkillsShowcase({ initialSkills }: SkillsShowcaseProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    return initialSkills.reduce((acc, skill) => {
      acc[skill.category] = acc[skill.category] || []
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, Skill[]>)
  }, [initialSkills])

  // Get active skills filtered by category
  const filteredSkills = useMemo(() => {
    if (activeCategory === 'All') {
      return initialSkills
    }
    return skillsByCategory[activeCategory] || []
  }, [initialSkills, skillsByCategory, activeCategory])

  // Radar chart constants
  const cx = 200
  const cy = 200
  const r = 130

  // Calculate radar chart points (always uses active tab items for web)
  const radarData = useMemo(() => {
    // If "All", grab Frontend category to keep the radar legible
    const list = activeCategory === 'All' ? (skillsByCategory['Frontend'] || []) : (skillsByCategory[activeCategory] || [])
    if (list.length < 3) return null

    const points = list.map((skill, i) => {
      const angle = (i * 2 * Math.PI) / list.length - Math.PI / 2
      const rv = (skill.proficiency / 100) * r
      const x = cx + rv * Math.cos(angle)
      const y = cy + rv * Math.sin(angle)
      
      const labelDistance = r + 24
      const lx = cx + labelDistance * Math.cos(angle)
      const ly = cx + labelDistance * Math.sin(angle)

      return {
        ...skill,
        x,
        y,
        lx,
        ly,
        angle
      }
    })

    const polygonPath = points.map((p) => `${p.x},${p.y}`).join(' ')
    return { points, polygonPath }
  }, [skillsByCategory, activeCategory, r])

  return (
    <section className="py-24 px-6 border-t border-border/50 relative z-10 overflow-hidden">
      {/* Interactive Floating Particles in Background */}
      <div className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none">
        <FloatingParticles count={30} />
      </div>
      {/* Large Interactive 3D Cylinder in Background */}
      <div className="absolute -left-16 -bottom-16 w-[320px] h-[320px] opacity-15 dark:opacity-10 pointer-events-none md:block hidden">
        <Interactive3DShape shape="cylinder" />
      </div>
      {/* Visual glowing meshes in background */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-500/5 dark:bg-sky-500/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/3 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
          <div className="space-y-3">
            <span className="flex items-center gap-1.5 text-sky-500 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Code2 size={14} /> Stack
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Development Ecosystem
            </h2>
            <p className="text-xs text-muted-foreground font-medium max-w-lg">
              Explore the tech stack and tools I use to craft high-performance SaaS applications and custom automation tools.
            </p>
          </div>

          {/* Selector view modes */}
          <div className="inline-flex p-1 bg-secondary/85 border border-border/60 rounded-xl shadow-inner self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-card text-sky-600 dark:text-sky-400 shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Visual Cards</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-card text-sky-600 dark:text-sky-400 shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart2 size={13} />
              <span>Interactive Spider</span>
            </button>
          </div>
        </div>

        {/* Categories Tab selectors */}
        <div className="flex overflow-x-auto gap-2 w-full justify-start items-center pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none snap-x whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => {
                setActiveCategory(category)
                setHoveredSkill(null)
              }}
              className={`px-4.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0 snap-center ${
                activeCategory === category
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 shadow-sm'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-foreground/20 hover:text-foreground'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* View Mode: Interactive Grid list of 3D Cards */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300">
            {filteredSkills.map((skill) => (
              <div
                key={skill.id}
                className="group relative p-4 sm:p-6 bg-card border border-border/60 rounded-2xl flex flex-col justify-between space-y-3 sm:space-y-5 transition-all duration-300 hover:border-sky-500/40 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Custom radial hover background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.06),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                <div className="flex items-start justify-between relative z-10">
                  {/* Styled Icon */}
                  <div className="p-2 sm:p-3 bg-secondary rounded-xl border border-border/40 group-hover:bg-sky-500/5 group-hover:border-sky-500/20 transition-all">
                    {getTechIcon(skill.name)}
                  </div>
                  {/* Category badge */}
                  <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/60 uppercase bg-secondary/80 border border-border/30 px-1.5 sm:px-2 py-0.5 rounded">
                    {skill.category}
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3.5 relative z-10">
                  <h3 className="text-xs sm:text-sm font-extrabold text-foreground tracking-tight group-hover:text-sky-500 transition-colors">
                    {skill.name}
                  </h3>
                  
                  {/* Custom loader ring representation */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-bold text-muted-foreground">
                      <span>Proficiency</span>
                      <span className="text-foreground">{skill.proficiency}%</span>
                    </div>
                    {/* Progress Slider bar */}
                    <div className="w-full h-1 bg-secondary rounded-full overflow-hidden border border-border/10">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 bg-[size:200%_auto] rounded-full transition-all duration-1000 group-hover:bg-[100%_0]"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Mode: Cyberpunk SVG Radar Chart */}
        {viewMode === 'chart' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 bg-card p-6 md:p-10 rounded-2xl border border-border shadow-lg max-w-3xl mx-auto relative overflow-hidden">
              
              {/* Center Glow element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-500/5 blur-[60px] pointer-events-none" />

              {/* Spider Web svg rendering */}
              <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                {activeCategory === 'All' && (
                  <div className="absolute inset-0 bg-background/85 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <Sparkles className="text-sky-500 animate-pulse" size={24} />
                    <h4 className="text-xs font-bold text-foreground">Select a specific category</h4>
                    <p className="text-[11px] text-muted-foreground max-w-[200px]">
                      Please choose Frontend, Backend, or Tools tab above to render the interactive spider web.
                    </p>
                  </div>
                )}

                {activeCategory !== 'All' && (!radarData || radarData.points.length < 3) ? (
                  <div className="text-center p-6 space-y-3">
                    <Sparkles className="mx-auto text-sky-500 animate-pulse" size={24} />
                    <p className="text-xs text-muted-foreground font-semibold">
                      Requires at least 3 skills in this category to render.
                    </p>
                  </div>
                ) : (
                  radarData && (
                    <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible select-none">
                      {/* Grid concentric rings */}
                      {[0.25, 0.5, 0.75, 1.0].map((scale, gridIdx) => {
                        const gridPoints = radarData.points.map((p) => {
                          const rv = scale * r
                          const x = cx + rv * Math.cos(p.angle)
                          const y = cy + rv * Math.sin(p.angle)
                          return `${x},${y}`
                        }).join(' ')

                        return (
                          <polygon
                            key={gridIdx}
                            points={gridPoints}
                            className="fill-none stroke-border/40 dark:stroke-border/25"
                            strokeWidth="1.2"
                            strokeDasharray={scale === 1 ? 'none' : '4,4'}
                          />
                        )
                      })}

                      {/* Axes lines */}
                      {radarData.points.map((p, idx) => {
                        const outerX = cx + r * Math.cos(p.angle)
                        const outerY = cy + r * Math.sin(p.angle)
                        return (
                          <line
                            key={idx}
                            x1={cx}
                            y1={cy}
                            x2={outerX}
                            y2={outerY}
                            className="stroke-border/40"
                            strokeWidth="1.2"
                          />
                        )
                      })}

                      {/* Radar Area Polygon */}
                      <polygon
                        points={radarData.polygonPath}
                        className="fill-sky-500/15 dark:fill-sky-500/10 stroke-sky-500 dark:stroke-sky-400"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />

                      {/* Interactive Dots */}
                      {radarData.points.map((p, idx) => (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredSkill(p)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          className="cursor-pointer group"
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="11"
                            className="fill-sky-500/0 group-hover:fill-sky-500/15 transition-all duration-200"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="6"
                            className="fill-sky-500 dark:fill-sky-400 stroke-card"
                            strokeWidth="2"
                          />
                        </g>
                      ))}

                      {/* Texts */}
                      {radarData.points.map((p, idx) => {
                        const isRight = Math.cos(p.angle) > 0.05
                        const isLeft = Math.cos(p.angle) < -0.05
                        const textAnchor = isRight ? 'start' : isLeft ? 'end' : 'middle'
                        
                        return (
                          <text
                            key={idx}
                            x={p.lx}
                            y={p.ly + 4}
                            textAnchor={textAnchor}
                            className="text-[10px] font-bold fill-foreground transition-all duration-200"
                          >
                            {p.name}
                          </text>
                        )
                      })}
                    </svg>
                  )
                )}
              </div>

              {/* Tooltip detail block */}
              <div className="flex-1 space-y-4 text-center md:text-left min-w-[200px] z-10">
                {hoveredSkill ? (
                  <div className="space-y-2.5 p-5 bg-secondary/50 border border-border rounded-xl animate-in zoom-in-95 duration-200">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                      Skill Metrics
                    </span>
                    <h4 className="text-base font-extrabold text-foreground">{hoveredSkill.name}</h4>
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span className="text-3xl font-black text-foreground tracking-tight">
                        {hoveredSkill.proficiency}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">% Level</span>
                    </div>
                    <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${hoveredSkill.proficiency}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-5 border border-border/60 border-dashed rounded-xl space-y-2 text-muted-foreground">
                    <Sparkles className="text-sky-500/60 mx-auto md:mx-0" size={20} />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Hover Over Nodes
                    </h4>
                    <p className="text-xs leading-normal font-semibold">
                      Hover over any node of the radar web chart to view absolute proficiency value metrics and skill metadata tags.
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-border/40">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Information Code
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center md:justify-start text-[10px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-sky-500" />
                      <span>Proficient</span>
                    </span>
                    <span>• 0-100% Index</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  )
}
