'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  alphaDir: number
  color: string
}

interface FloatingParticlesProps {
  count?: number
  className?: string
}

export default function FloatingParticles({ count = 55, className = '' }: FloatingParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const isDarkRef = useRef(false)

  const getColors = () => {
    const dark = document.documentElement.classList.contains('dark')
    isDarkRef.current = dark
    return dark
      ? ['rgba(56,189,248,', 'rgba(129,140,248,', 'rgba(34,211,238,', 'rgba(99,102,241,']
      : ['rgba(14,165,233,',  'rgba(99,102,241,',  'rgba(6,182,212,',   'rgba(139,92,246,']
  }

  const initParticles = useCallback((w: number, h: number) => {
    const colors = getColors()
    particlesRef.current = Array.from({ length: count }, () => {
      const colorBase = colors[Math.floor(Math.random() * colors.length)]
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 0.8,
        alpha: Math.random() * 0.5 + 0.1,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        color: colorBase,
      }
    })
  }, [count])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const setSize = () => {
      const parent = canvas.parentElement
      canvas.width  = parent ? parent.clientWidth  : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    setSize()
    const ro = new ResizeObserver(setSize)
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Re-init colors on theme toggle
    const observer = new MutationObserver(() => {
      const colors = getColors()
      particlesRef.current.forEach(p => {
        p.color = colors[Math.floor(Math.random() * colors.length)]
      })
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const CONN_DIST = 110

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current

      // Update positions
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        // Bounce off edges
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        // Pulse alpha
        p.alpha += 0.004 * p.alphaDir
        const maxAlpha = isDarkRef.current ? 0.65 : 0.82
        const minAlpha = isDarkRef.current ? 0.05 : 0.18
        if (p.alpha >= maxAlpha || p.alpha <= minAlpha) p.alphaDir *= -1
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONN_DIST) {
            const lineAlpha = (1 - dist / CONN_DIST) * (isDarkRef.current ? 0.18 : 0.38)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `${particles[i].color}${lineAlpha})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      // Draw dots
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      observer.disconnect()
    }
  }, [initParticles])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
