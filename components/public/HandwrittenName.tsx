'use client'

import { useEffect, useRef } from 'react'

export default function HandwrittenName() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const paths = svgRef.current.querySelectorAll('path')
    
    // Configurations for each stroke in the handwriting sequence
    const strokeConfigs = [
      { duration: 1.2, delay: 0.1 },   // M
      { duration: 0.2, delay: 1.3 },   // Dot
      { duration: 0.8, delay: 1.5 },   // F
      { duration: 2.2, delay: 2.3 }    // arhan + underline flourish
    ]

    // 1. Set the initial state (fully hidden) and the transition parameters
    paths.forEach((path, idx) => {
      const length = path.getTotalLength()
      path.style.strokeDasharray = `${length}`
      path.style.strokeDashoffset = `${length}`
      
      const config = strokeConfigs[idx] || { duration: 1.0, delay: 0.0 }
      path.style.transition = 'none' // Remove transition for the initial set
    })

    // 2. Force layout reflow
    svgRef.current.getBoundingClientRect()

    // 3. Apply the transitions and animate after a short delay so the browser registers the change
    const timer = setTimeout(() => {
      paths.forEach((path, idx) => {
        const config = strokeConfigs[idx] || { duration: 1.0, delay: 0.0 }
        path.style.transition = `stroke-dashoffset ${config.duration}s cubic-bezier(0.4, 0, 0.2, 1)`
        path.style.transitionDelay = `${config.delay}s`
        path.style.strokeDashoffset = '0'
      })
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative inline-flex items-center select-none py-1">
      {/* Soft background glow matching theme */}
      <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/10 to-indigo-500/10 blur-xl rounded-full opacity-60 pointer-events-none" />
      
      <svg
        ref={svgRef}
        viewBox="0 0 240 70"
        className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-[0_2px_8px_rgba(14,165,233,0.3)]"
        fill="none"
        stroke="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="signatureGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
            <stop offset="100%" stopColor="#6366f1" /> {/* indigo-500 */}
          </linearGradient>
        </defs>

        {/* M */}
        <path
          d="M 20,50 C 15,35 22,12 32,12 C 42,12 36,52 46,52 C 56,52 50,15 60,15 C 67,15 70,30 70,47 C 70,53 62,53 62,47"
          stroke="url(#signatureGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transitionDelay: '0.1s' }}
        />

        {/* Dot */}
        <path
          d="M 77,48 C 77,46 79,46 79,48 C 79,50 77,50 77,48 Z"
          stroke="url(#signatureGrad)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transitionDelay: '0.9s' }}
        />

        {/* F Stem & Loop */}
        <path
          d="M 98,16 C 82,16 88,52 88,52 M 88,52 C 85,55 80,51 86,45 C 92,39 104,39 104,39"
          stroke="url(#signatureGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transitionDelay: '1.1s' }}
        />

        {/* Cursive chain: a - r - h - a - n + underline flourish */}
        <path
          d="M 108,48 C 104,48 102,44 102,40 C 102,36 106,32 110,32 C 114,32 116,38 116,42 L 116,50 C 116,50 120,44 123,37 C 126,37 128,38 129,40 C 129,43 126,47 126,50 C 126,50 130,40 133,22 C 135,10 140,12 138,26 L 136,50 C 136,50 140,41 144,38 C 148,35 150,39 150,43 L 150,50 C 150,50 153,44 157,37 C 160,37 163,41 163,45 L 163,50 C 163,50 166,42 169,38 C 172,35 175,39 175,43 L 175,50 C 178,46 182,42 186,39 C 190,36 195,38 198,42 C 201,46 211,48 221,48 C 228,48 232,44 235,40"
          stroke="url(#signatureGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transitionDelay: '1.6s' }}
        />
      </svg>
    </div>
  )
}
