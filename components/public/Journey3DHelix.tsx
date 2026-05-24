'use client'

import { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
  color: string
}

export default function Journey3DHelix() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleYRef = useRef(0)
  const angleXRef = useRef(0.12) // Slightly tilted pitch
  const mouseRef = useRef({ targetX: 0, currentX: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement

    const resize = () => {
      canvas.width = parent ? parent.clientWidth : 60
      canvas.height = parent ? parent.clientHeight : 800
    }
    resize()

    const ro = new ResizeObserver(resize)
    if (parent) ro.observe(parent)

    // Handle mouse movement for tilt influence
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - canvas.width / 2
      mouseRef.current.targetX = mx * 0.0005
    }

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
    }

    let frameId = 0

    const draw = () => {
      // Rotation speed is slightly faster as requested: 0.022 (was 0.008)
      angleYRef.current += 0.022
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Interpolate mouse effect
      mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.05
      const yaw = angleYRef.current + mouseRef.current.currentX
      const pitch = angleXRef.current

      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosP = Math.cos(pitch)
      const sinP = Math.sin(pitch)

      // Dynamic Helix Configuration based on parent container height
      const H = canvas.height
      const helixHeight = H * 0.98
      // Radius is slim: 12px (was 55px)
      const helixRadius = 12
      // Dynamic turns and sample counts to keep density uniform
      const turns = Math.max(3, (H / 140))
      const samples = Math.max(40, Math.floor(H / 10)) // denser samples for clean line outline path
      const FOCAL_LENGTH = 300

      const strandA: Point3D[] = []
      const strandB: Point3D[] = []

      // Generate coordinates
      for (let i = 0; i < samples; i++) {
        const ratio = i / (samples - 1)
        const theta = ratio * turns * Math.PI * 2
        const yCenter = (ratio - 0.5) * helixHeight

        // Strand A
        const ax = helixRadius * Math.cos(theta)
        const ay = yCenter
        const az = helixRadius * Math.sin(theta)

        // Strand B (180 deg phase offset)
        const bx = helixRadius * Math.cos(theta + Math.PI)
        const by = yCenter
        const bz = helixRadius * Math.sin(theta + Math.PI)

        strandA.push({ x: ax, y: ay, z: az, color: '#38bdf8' }) // sky-400
        strandB.push({ x: bx, y: by, z: bz, color: '#818cf8' }) // indigo-400
      }

      // Projection
      const project = (pt: Point3D) => {
        // Rotate Y (yaw)
        const x1 = pt.x * cosY - pt.z * sinY
        const z1 = pt.z * cosY + pt.x * sinY

        // Rotate X (pitch)
        const y2 = pt.y * cosP - z1 * sinP
        const z2 = z1 * cosP + pt.y * sinP

        // Depth translation
        const finalZ = z2 + 350
        const scale = FOCAL_LENGTH / finalZ
        const px = x1 * scale + canvas.width / 2
        const py = y2 * scale + canvas.height / 2

        const alpha = Math.max(0.12, Math.min(0.7, (500 - finalZ) / 250))

        return { px, py, pz: finalZ, scale, alpha, color: pt.color }
      }

      const projA = strandA.map(project)
      const projB = strandB.map(project)

      // Draw Struts (cross-bars connecting strands A & B)
      ctx.lineWidth = 0.8
      for (let i = 0; i < samples; i++) {
        // Cross-bars spacing
        if (i % 4 === 0) {
          const ptA = projA[i]
          const ptB = projB[i]
          const avgAlpha = (ptA.alpha + ptB.alpha) / 2

          ctx.beginPath()
          ctx.moveTo(ptA.px, ptA.py)
          ctx.lineTo(ptB.px, ptB.py)
          ctx.strokeStyle = `rgba(148, 163, 184, ${avgAlpha * 0.25})`
          ctx.stroke()
        }
      }

      // Draw Strand A Outline
      ctx.lineWidth = 1.1
      for (let i = 0; i < samples - 1; i++) {
        const pt1 = projA[i]
        const pt2 = projA[i + 1]
        const avgAlpha = (pt1.alpha + pt2.alpha) / 2
        ctx.beginPath()
        ctx.moveTo(pt1.px, pt1.py)
        ctx.lineTo(pt2.px, pt2.py)
        ctx.strokeStyle = `rgba(56, 189, 248, ${avgAlpha * 0.6})`
        ctx.stroke()
      }

      // Draw Strand B Outline
      ctx.lineWidth = 1.1
      for (let i = 0; i < samples - 1; i++) {
        const pt1 = projB[i]
        const pt2 = projB[i + 1]
        const avgAlpha = (pt1.alpha + pt2.alpha) / 2
        ctx.beginPath()
        ctx.moveTo(pt1.px, pt1.py)
        ctx.lineTo(pt2.px, pt2.py)
        ctx.strokeStyle = `rgba(129, 140, 248, ${avgAlpha * 0.6})`
        ctx.stroke()
      }

      // Draw Strand A Node Spheres (slimmer dots: size = 1.6)
      projA.forEach((pt) => {
        ctx.beginPath()
        ctx.arc(pt.px, pt.py, 1.6 * pt.scale, 0, Math.PI * 2)
        ctx.fillStyle = pt.color
        ctx.globalAlpha = pt.alpha
        ctx.fill()
      })

      // Draw Strand B Node Spheres
      projB.forEach((pt) => {
        ctx.beginPath()
        ctx.arc(pt.px, pt.py, 1.6 * pt.scale, 0, Math.PI * 2)
        ctx.fillStyle = pt.color
        ctx.globalAlpha = pt.alpha
        ctx.fill()
      })

      ctx.globalAlpha = 1.0
      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
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
