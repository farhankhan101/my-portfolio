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

    const colors = [
      'rgba(56, 189, 248, ',  // sky-400
      'rgba(129, 140, 248, ', // indigo-400
      'rgba(6, 182, 212, ',   // cyan-500
      'rgba(165, 180, 252, ', // indigo-300
      'rgba(244, 63, 94, '    // rose-500 (extra subtle accent)
    ]

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
        for (let i = 0; i < spawnCount; i++) {
          const type = Math.random() > 0.45 ? 'star' : 'dust'
          const randomColor = colors[Math.floor(Math.random() * colors.length)]
          
          particlesRef.current.push({
            x: mx + (Math.random() - 0.5) * 8,
            y: my + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.5, // slight upward float
            size: type === 'star' ? Math.random() * 5 + 3 : Math.random() * 2 + 1,
            alpha: 1,
            decay: 0.015 + Math.random() * 0.02,
            color: randomColor,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.08,
            type
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
        p.rotation += p.rotationSpeed

        if (p.alpha <= 0) {
          particles.splice(i, 1)
          continue
        }

        const colorStr = `${p.color}${p.alpha})`

        if (p.type === 'star') {
          // Draw standard custom glowing star shape
          drawStar(ctx, p.x, p.y, 4, p.size, p.size / 2.5, colorStr, p.rotation)
          
          // Draw soft radial blur background on hover
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${p.alpha * 0.15})`
          ctx.fill()
        } else {
          // Draw small dust particle
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = colorStr
          ctx.fill()
        }
      }

      animationFrameId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      style={{ mixBlendMode: 'screen' }}
      aria-hidden="true"
    />
  )
}
