'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  decay: number
  color: string
  rotation: number
  rotationSpeed: number
  type: 'star' | 'dust'
}

export default function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const lastMousePos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const getColors = () => {
      const isDark = document.documentElement.classList.contains('dark')
      return isDark
        ? [
            'rgba(56, 189, 248, ',  // sky-400 (light blue)
            'rgba(6, 182, 212, ',   // cyan-500 (cyan)
            'rgba(14, 165, 233, ',  // sky-500 (blue)
            'rgba(2, 132, 199, ',   // sky-700 (mid blue)
            'rgba(3, 105, 161, '    // sky-800 (deep blue)
          ]
        : [
            'rgba(56, 189, 248, ',  // sky-400 (light blue)
            'rgba(14, 165, 233, ',  // sky-500 (vibrant blue)
            'rgba(6, 182, 212, ',   // cyan-500 (cyan)
            'rgba(255, 255, 255, ', // pure white (blends/fades on light bg)
            'rgba(255, 255, 255, '  // pure white (blends/fades on light bg)
          ]
    }

    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      canvas.style.mixBlendMode = isDark ? 'screen' : 'normal'
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    // Set initial blend mode
    const isDark = document.documentElement.classList.contains('dark')
    canvas.style.mixBlendMode = isDark ? 'screen' : 'normal'

    const drawStar = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      rotation: number
    ) => {
      let rot = (Math.PI / 2) * 3 + rotation
      let x = cx
      let y = cy
      const step = Math.PI / spikes

      c.beginPath()
      c.moveTo(cx, cy - outerRadius)
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius
        y = cy + Math.sin(rot) * outerRadius
        c.lineTo(x, y)
        rot += step

        x = cx + Math.cos(rot) * innerRadius
        y = cy + Math.sin(rot) * innerRadius
        c.lineTo(x, y)
        rot += step
      }
      c.lineTo(cx, cy - outerRadius)
      c.closePath()
      c.fillStyle = color
      c.fill()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const mx = e.clientX
      const my = e.clientY

      // Calculate distance moved
      const dx = mx - lastMousePos.current.x
      const dy = my - lastMousePos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      lastMousePos.current = { x: mx, y: my }
      hasMoved.current = true

      // Spawn particles only if cursor moves enough, to optimize performance
      if (dist > 2) {
        const spawnCount = Math.min(Math.floor(dist / 4) + 1, 4)
        const currentColors = getColors()
        for (let i = 0; i < spawnCount; i++) {
          const randomColor = currentColors[Math.floor(Math.random() * currentColors.length)]
          
          particlesRef.current.push({
            x: mx + (Math.random() - 0.5) * 8,
            y: my + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5, // slight upward float
            size: Math.random() * 4 + 1.8, // nice glowing dot sizes
            alpha: 1,
            decay: 0.015 + Math.random() * 0.02,
            color: randomColor,
            rotation: 0,
            rotationSpeed: 0,
            type: 'dust'
          })
        }
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animationFrameId = 0
    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const particles = particlesRef.current

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.alpha -= p.decay

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        const colorStr = `${p.color}${p.alpha})`

        // Draw clean glowing circular dot particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = colorStr
        ctx.fill()
        
        // Draw soft glowing radial blur background
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.alpha * 0.15})`
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      aria-hidden="true"
    />
  )
}
