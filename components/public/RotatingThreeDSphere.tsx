'use client'

import { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  color: string
  size: number
}

export default function RotatingThreeDSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointsRef = useRef<Point3D[]>([])
  const angleXRef = useRef(0.002) // Continuous auto-rotation speed X
  const angleYRef = useRef(0.003) // Continuous auto-rotation speed Y
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const parent = canvas.parentElement
      canvas.width = parent ? parent.clientWidth : window.innerWidth
      canvas.height = parent ? parent.clientHeight : window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize 3D points on a sphere surface (point cloud)
    const points: Point3D[] = []
    const count = 180
    const radius = 140

    const colors = [
      '#38bdf8', // sky-400
      '#818cf8', // indigo-400
      '#06b6d4', // cyan-500
      '#c084fc'  // purple-400
    ]

    for (let i = 0; i < count; i++) {
      // Golden spiral distribution on a sphere
      const phi = Math.acos(-1 + (2 * i) / count)
      const theta = Math.sqrt(count * Math.PI) * phi

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      points.push({
        x,
        y,
        z,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 2 + 1
      })
    }
    pointsRef.current = points

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - canvas.width / 2
      const my = e.clientY - rect.top - canvas.height / 2

      // Map mouse displacement to target rotation speed
      mouseRef.current.targetX = mx * 0.00003
      mouseRef.current.targetY = my * 0.00003
    }

    const parent = canvas.parentElement
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
    }

    const FOCAL_LENGTH = 300
    let frameId = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smoothly interpolate rotation speed towards mouse target speed
      angleXRef.current += (mouseRef.current.targetY - angleXRef.current) * 0.05
      angleYRef.current += (mouseRef.current.targetX - angleYRef.current) * 0.05

      // Add a base drift speed so it always spins slowly even if mouse is static
      const rx = angleXRef.current + 0.001
      const ry = angleYRef.current + 0.0015

      const cosX = Math.cos(rx)
      const sinX = Math.sin(rx)
      const cosY = Math.cos(ry)
      const sinY = Math.sin(ry)

      const pts = pointsRef.current

      // Rotate and cache coordinate calculations
      const projected = pts.map((p) => {
        // Rotate around X-axis
        let y1 = p.y * cosX - p.z * sinX
        let z1 = p.z * cosX + p.y * sinX

        // Rotate around Y-axis
        let x2 = p.x * cosY - z1 * sinY
        let z2 = z1 * cosY + p.x * sinY

        // Save rotated coordinates
        p.x = x2
        p.y = y1
        p.z = z2

        // Project onto 2D screen using perspective scale
        const scale = FOCAL_LENGTH / (FOCAL_LENGTH + z2)
        const projX = x2 * scale + canvas.width / 2
        const projY = y1 * scale + canvas.height / 2

        return {
          px: projX,
          py: projY,
          pz: z2,
          scale,
          color: p.color,
          size: p.size
        }
      })

      // Sort points by Z-depth (painters algorithm) to render back elements first
      projected.sort((a, b) => b.pz - a.pz)

      // Draw projected points
      projected.forEach((p) => {
        // Opacity based on depth (z coordinate range approx -radius to +radius)
        // Closer points are brighter
        const alpha = Math.max(0.15, Math.min(1.0, (radius - p.pz) / (2 * radius) + 0.2))

        ctx.beginPath()
        ctx.arc(p.px, p.py, p.size * p.scale, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = alpha
        ctx.fill()

        // Soft glow for closer particles
        if (p.pz < -60) {
          ctx.beginPath()
          ctx.arc(p.px, p.py, p.size * p.scale * 3.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alpha * 0.12
          ctx.fill()
        }
      })

      ctx.globalAlpha = 1.0 // Reset alpha
      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
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
