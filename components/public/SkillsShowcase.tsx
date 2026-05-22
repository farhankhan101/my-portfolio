// components/public/SkillsShowcase.tsx
'use client'

import { useState, useMemo } from 'react'
import { LayoutGrid, BarChart2, Code2, Sparkles } from 'lucide-react'

interface Skill {
  id: string
  name: string
  proficiency: number
  category: string
}

interface SkillsShowcaseProps {
  initialSkills: Skill[]
}

const CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Tools']

export default function SkillsShowcase({ initialSkills }: SkillsShowcaseProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid')
  const [activeCategory, setActiveCategory] = useState<string>('Frontend')
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null)

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    return initialSkills.reduce((acc, skill) => {
      acc[skill.category] = acc[skill.category] || []
      acc[skill.category].push(skill)
      return acc
    }, {} as Record<string, Skill[]>)
  }, [initialSkills])

  // Get skills for active chart category
  const activeSkills = useMemo(() => {
    return skillsByCategory[activeCategory] || []
  }, [skillsByCategory, activeCategory])

  // Radar chart constants
  const cx = 200
  const cy = 200
  const r = 130

  // Calculate radar chart points
  const radarData = useMemo(() => {
    if (activeSkills.length < 3) return null

    const points = activeSkills.map((skill, i) => {
      const angle = (i * 2 * Math.PI) / activeSkills.length - Math.PI / 2
      const rv = (skill.proficiency / 100) * r
      const x = cx + rv * Math.cos(angle)
      const y = cy + rv * Math.sin(angle)
      
      // Outer point for label and grid lines
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
  }, [activeSkills, r])

  return (
    <section className="py-20 px-6 border-t border-border/50 bg-secondary/10 relative z-10">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header with Selector */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/40 pb-6">
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Code2 size={14} /> Technologies
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Development Ecosystem
            </h2>
          </div>

          {/* Toggle buttons */}
          <div className="inline-flex p-1 bg-secondary border border-border rounded-lg shadow-sm w-fit self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-card text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={14} />
              <span>Grid List</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-card text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <BarChart2 size={14} />
              <span>Ecosystem Chart</span>
            </button>
          </div>
        </div>

        {/* View Mode: Grid Layout */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {CATEGORIES.map((category) => {
              const list = skillsByCategory[category] || []
              return (
                <div key={category} className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {list.map((skill) => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-foreground">
                          <span>{skill.name}</span>
                          <span className="text-[10px] text-muted-foreground">{skill.proficiency}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/10">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${skill.proficiency}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* View Mode: SVG Radar Chart */}
        {viewMode === 'chart' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 justify-center">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setHoveredSkill(null)
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    activeCategory === category
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                      : 'bg-secondary text-muted-foreground border-border hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Radar Chart Center Block */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 bg-card p-6 md:p-10 rounded-2xl border border-border shadow-lg max-w-3xl mx-auto relative overflow-hidden">
              
              {/* Decorative radial lighting */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/5 blur-[50px] pointer-events-none" />

              {/* Left Side: SVG Chart representation */}
              <div className="relative w-[340px] h-[340px] flex items-center justify-center">
                {activeSkills.length < 3 ? (
                  /* Fallback if a category has fewer than 3 skills */
                  <div className="text-center p-6 space-y-3">
                    <Sparkles className="mx-auto text-sky-500 animate-pulse" size={24} />
                    <p className="text-xs text-muted-foreground font-semibold">
                      Need at least 3 skills to render a spider web. Here are your skills:
                    </p>
                    <div className="space-y-2">
                      {activeSkills.map(s => (
                        <div key={s.id} className="text-xs font-bold text-foreground">
                          {s.name}: {s.proficiency}%
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  radarData && (
                    <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible select-none">
                      {/* Grid concentric polygons (25%, 50%, 75%, 100%) */}
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
                            className="fill-none stroke-border/50 dark:stroke-border/40"
                            strokeWidth="1"
                            strokeDasharray={scale === 1 ? 'none' : '4,4'}
                          />
                        )
                      })}

                      {/* Axes lines from center to outer points */}
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
                            className="stroke-border/60"
                            strokeWidth="1"
                          />
                        )
                      })}

                      {/* Filled Radar Polygon */}
                      <polygon
                        points={radarData.polygonPath}
                        className="fill-sky-500/20 dark:fill-sky-500/15 stroke-sky-500 dark:stroke-sky-400"
                        strokeWidth="2.5"
                        strokeLinejoin="round"
                      />

                      {/* Interactive Vertex Dots */}
                      {radarData.points.map((p, idx) => (
                        <g
                          key={idx}
                          onMouseEnter={() => setHoveredSkill(p)}
                          onMouseLeave={() => setHoveredSkill(null)}
                          className="cursor-pointer group"
                        >
                          {/* Pulsing glow ring on hover */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="10"
                            className="fill-sky-500/0 group-hover:fill-sky-500/20 transition-all duration-200"
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="5.5"
                            className="fill-sky-500 dark:fill-sky-400 stroke-card"
                            strokeWidth="1.5"
                          />
                        </g>
                      ))}

                      {/* Labels placed outside the grid */}
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

              {/* Right Side: Tooltip Card & Summary info */}
              <div className="flex-1 space-y-4 text-center md:text-left min-w-[200px] z-10">
                {hoveredSkill ? (
                  <div className="space-y-2 p-5 bg-secondary/50 border border-border rounded-xl animate-in zoom-in-95 duration-200">
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                      Active Node
                    </span>
                    <h4 className="text-base font-extrabold text-foreground">{hoveredSkill.name}</h4>
                    <div className="flex items-baseline justify-center md:justify-start gap-1">
                      <span className="text-3xl font-black text-foreground tracking-tight">
                        {hoveredSkill.proficiency}
                      </span>
                      <span className="text-xs text-muted-foreground font-bold">% Proficiency</span>
                    </div>
                    {/* Visual bar tracker */}
                    <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-2">
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
                      Hover on any vertex dot of the spider web to display exact proficiency metrics and category percentages.
                    </p>
                  </div>
                )}

                {/* Legend/Overview indicator */}
                <div className="pt-2 border-t border-border/40 text-center md:text-left">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    Radar Chart Scale
                  </span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center md:justify-start text-[10px] text-muted-foreground font-semibold">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded bg-sky-500/20 border border-sky-500" />
                      <span>Proficiency Level</span>
                    </span>
                    <span>• 0-100% Range</span>
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
