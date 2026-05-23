'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number         // Current coordinate X
  y: number         // Current coordinate Y
  targetX: number   // Animation target X
  targetY: number   // Animation target Y
  originX: number   // Original base X
  originY: number   // Original base Y
  vx: number        // Velocity X for drift
  vy: number        // Velocity Y for drift
  size: number
  opacity: number
  opacitySpeed: number
  color: string
}

export default function InteractiveStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Colors matching sky/indigo theme
    const colors = [
      'rgba(56, 189, 248, ',  // sky-400
      'rgba(129, 140, 248, ', // indigo-400
      'rgba(6, 182, 212, ',   // cyan-500
      'rgba(165, 180, 252, '  // indigo-300
    ]

    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent ? parent.clientWidth : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight

      // Initialize stars
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 100)
      const stars: Star[] = []

      for (let i = 0; i < count; i++) {
        const rx = Math.random() * canvas.width
        const ry = Math.random() * canvas.height
        stars.push({
          x: rx,
          y: ry,
          targetX: rx,
          targetY: ry,
          originX: rx,
          originY: ry,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 2.5 + 0.8,
          opacity: Math.random() * 0.7 + 0.3,
          opacitySpeed: 0.005 + Math.random() * 0.015,
          color: colors[Math.floor(Math.random() * colors.length)]
        })
      }
      starsRef.current = stars
    }

    resize()
    window.addEventListener('resize', resize)

    // Tracks mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.x = -1000
      mouseRef.current.y = -1000
      mouseRef.current.active = false
    }

    const container = canvas.parentElement
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    const REPEL_RADIUS = 160
    const REPEL_FORCE = 65

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const stars = starsRef.current
      const mouse = mouseRef.current

      // Update positions
      stars.forEach((star) => {
        // Slow drifting movement
        star.originX += star.vx
        star.originY += star.vy

        // Wrap around edges
        if (star.originX < 0) star.originX = canvas.width
        if (star.originX > canvas.width) star.originX = 0
        if (star.originY < 0) star.originY = canvas.height
        if (star.originY > canvas.height) star.originY = 0

        // Calculate repel from mouse
        if (mouse.active) {
          const dx = star.originX - mouse.x
          const dy = star.originY - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < REPEL_RADIUS) {
            // Stronger push when closer
            const force = (REPEL_RADIUS - dist) / REPEL_RADIUS
            const angle = Math.atan2(dy, dx)
            
            star.targetX = star.originX + Math.cos(angle) * force * REPEL_FORCE
            star.targetY = star.originY + Math.sin(angle) * force * REPEL_FORCE
          } else {
            star.targetX = star.originX
            star.targetY = star.originY
          }
        } else {
          star.targetX = star.originX
          star.targetY = star.originY
        }

        // Interpolate current position to target for organic delay/spring feel
        star.x += (star.targetX - star.x) * 0.08
        star.y += (star.targetY - star.y) * 0.08

        // Pulse brightness (twinkling)
        star.opacity += star.opacitySpeed
        if (star.opacity > 0.95 || star.opacity < 0.2) {
          star.opacitySpeed = -star.opacitySpeed
        }
      })

      // Draw connection lines between nearby stars
      const maxConnDist = 120
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x
          const dy = stars[i].y - stars[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxConnDist) {
            const lineOpacity = (1 - dist / maxConnDist) * 0.15
            ctx.beginPath()
            ctx.moveTo(stars[i].x, stars[i].y)
            ctx.lineTo(stars[j].x, stars[j].y)
            ctx.strokeStyle = `rgba(129, 140, 248, ${lineOpacity})` // indigo connection
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw stars with radial glow gradients
      stars.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `${star.color}${star.opacity})`
        ctx.fill()

        // Occasional extra soft glow on larger stars
        if (star.size > 2) {
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = `${star.color}${star.opacity * 0.12})`
          ctx.fill()
        }
      })

      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
