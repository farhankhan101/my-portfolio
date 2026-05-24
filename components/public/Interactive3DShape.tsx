'use client'

import { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
}

interface Edge {
  a: number
  b: number
}

interface Interactive3DShapeProps {
  shape: 'cube' | 'pyramid' | 'torus' | 'cylinder' | 'sphere' | 'network'
  hovered?: boolean
  className?: string
}

export default function Interactive3DShape({ shape, hovered: propHovered, className = '' }: Interactive3DShapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleXRef = useRef(0)
  const angleYRef = useRef(0)
  const angleZRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement
    let isHovered = false

    const onEnter = () => { isHovered = true }
    const onLeave = () => { isHovered = false }

    if (parent) {
      parent.addEventListener('mouseenter', onEnter)
      parent.addEventListener('mouseleave', onLeave)
    }

    let width = canvas.width
    let height = canvas.height

    const resize = () => {
      width = parent ? parent.clientWidth : 200
      height = parent ? parent.clientHeight : 200
      canvas.width = width
      canvas.height = height
    }
    resize()

    const ro = new ResizeObserver(resize)
    if (parent) ro.observe(parent)

    // Define 3D geometries
    let vertices: Point3D[] = []
    let edges: Edge[] = []
    const scaleFactor = Math.min(width, height) * 0.28

    if (shape === 'cube') {
      // 8 Vertices
      vertices = [
        { x: -1, y: -1, z: -1 },
        { x: 1, y: -1, z: -1 },
        { x: 1, y: 1, z: -1 },
        { x: -1, y: 1, z: -1 },
        { x: -1, y: -1, z: 1 },
        { x: 1, y: -1, z: 1 },
        { x: 1, y: 1, z: 1 },
        { x: -1, y: 1, z: 1 },
      ]
      // 12 Edges
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
        { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
        { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
      ]
    } else if (shape === 'pyramid') {
      // Octahedron (Double Pyramid)
      vertices = [
        { x: 0, y: -1.3, z: 0 }, // Top
        { x: 0, y: 1.3, z: 0 },  // Bottom
        { x: -1, y: 0, z: -1 },
        { x: 1, y: 0, z: -1 },
        { x: 1, y: 0, z: 1 },
        { x: -1, y: 0, z: 1 },
      ]
      edges = [
        { a: 0, b: 2 }, { a: 0, b: 3 }, { a: 0, b: 4 }, { a: 0, b: 5 },
        { a: 1, b: 2 }, { a: 1, b: 3 }, { a: 1, b: 4 }, { a: 1, b: 5 },
        { a: 2, b: 3 }, { a: 3, b: 4 }, { a: 4, b: 5 }, { a: 5, b: 2 },
      ]
    } else if (shape === 'torus') {
      // Orbital Rings (Double circular system)
      const segments = 16
      // Ring 1 (Horizontal)
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments
        vertices.push({ x: Math.cos(theta), y: 0, z: Math.sin(theta) })
      }
      // Ring 2 (Vertical)
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments
        vertices.push({ x: 0, y: Math.cos(theta), z: Math.sin(theta) * 0.9 })
      }
      // Ring 3 (Tilt)
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments
        vertices.push({ x: Math.cos(theta) * 0.7, y: Math.sin(theta) * 0.7, z: 0 })
      }

      // Edges for horizontal
      for (let i = 0; i < segments; i++) {
        edges.push({ a: i, b: (i + 1) % segments })
      }
      // Edges for vertical
      for (let i = 0; i < segments; i++) {
        edges.push({ a: segments + i, b: segments + ((i + 1) % segments) })
      }
      // Edges for tilt
      for (let i = 0; i < segments; i++) {
        edges.push({ a: 2 * segments + i, b: 2 * segments + ((i + 1) % segments) })
      }
    } else if (shape === 'cylinder') {
      // Cylinder / Database Disk stack
      const segments = 10
      // Top Ring
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments
        vertices.push({ x: Math.cos(theta) * 0.9, y: -0.9, z: Math.sin(theta) * 0.9 })
      }
      // Bottom Ring
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments
        vertices.push({ x: Math.cos(theta) * 0.9, y: 0.9, z: Math.sin(theta) * 0.9 })
      }
      // Connecting edges
      for (let i = 0; i < segments; i++) {
        edges.push({ a: i, b: (i + 1) % segments })
        edges.push({ a: segments + i, b: segments + ((i + 1) % segments) })
        edges.push({ a: i, b: segments + i })
      }
    } else if (shape === 'sphere') {
      // Simple wireframe sphere
      const rings = 4
      const sectors = 8
      const radius = 1.0

      for (let r = 1; r < rings; r++) {
        const phi = (r * Math.PI) / rings
        for (let s = 0; s < sectors; s++) {
          const theta = (s * 2 * Math.PI) / sectors
          vertices.push({
            x: radius * Math.sin(phi) * Math.cos(theta),
            y: radius * Math.cos(phi),
            z: radius * Math.sin(phi) * Math.sin(theta)
          })
        }
      }
      // Top & Bottom poles
      vertices.push({ x: 0, y: radius, z: 0 }) // Ring * Sectors
      vertices.push({ x: 0, y: -radius, z: 0 }) // Ring * Sectors + 1
      const topPoleIdx = (rings - 1) * sectors
      const bottomPoleIdx = topPoleIdx + 1

      // Latitudinal edges
      for (let r = 0; r < rings - 1; r++) {
        const offset = r * sectors
        for (let s = 0; s < sectors; s++) {
          edges.push({ a: offset + s, b: offset + ((s + 1) % sectors) })
          // Connect vertically to next ring
          if (r < rings - 2) {
            edges.push({ a: offset + s, b: offset + s + sectors })
          }
        }
      }

      // Connect poles
      for (let s = 0; s < sectors; s++) {
        edges.push({ a: s, b: topPoleIdx })
        edges.push({ a: (rings - 2) * sectors + s, b: bottomPoleIdx })
      }
    } else {
      // Network (Connected Neural Nodes)
      const count = 18
      const nodes: Point3D[] = []
      // Seed random nodes on sphere shell
      for (let i = 0; i < count; i++) {
        const u = Math.random()
        const v = Math.random()
        const theta = u * 2.0 * Math.PI
        const phi = Math.acos(2.0 * v - 1.0)
        nodes.push({
          x: Math.sin(phi) * Math.cos(theta),
          y: Math.cos(phi),
          z: Math.sin(phi) * Math.sin(theta)
        })
      }
      vertices = nodes

      // Calculate connections based on distance
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = vertices[i].x - vertices[j].x
          const dy = vertices[i].y - vertices[j].y
          const dz = vertices[i].z - vertices[j].z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < 1.15) {
            edges.push({ a: i, b: j })
          }
        }
      }
    }

    // Keep copies for transformations
    const transformed = vertices.map(v => ({ ...v }))

    let frameId = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Dynamic rotation speed based on hover state
      const activeHover = propHovered !== undefined ? propHovered : isHovered
      const baseSpeed = activeHover ? 0.022 : 0.007
      angleXRef.current += baseSpeed * 0.8
      angleYRef.current += baseSpeed * 1.2
      angleZRef.current += baseSpeed * 0.5

      const cosX = Math.cos(angleXRef.current)
      const sinX = Math.sin(angleXRef.current)
      const cosY = Math.cos(angleYRef.current)
      const sinY = Math.sin(angleYRef.current)
      const cosZ = Math.cos(angleZRef.current)
      const sinZ = Math.sin(angleZRef.current)

      // Transform 3D coordinates
      const projected = vertices.map((v, i) => {
        let x = v.x
        let y = v.y
        let z = v.z

        // Rotate X
        const y1 = y * cosX - z * sinX
        const z1 = z * cosX + y * sinX

        // Rotate Y
        const x2 = x * cosY - z1 * sinY
        const z2 = z1 * cosY + x * sinY

        // Rotate Z
        const x3 = x2 * cosZ - y1 * sinZ
        const y3 = y1 * cosZ + x2 * sinZ

        transformed[i] = { x: x3, y: y3, z: z2 }

        // Orthographic/Perspective hybrid scale
        const distance = 2.4
        const scale = scaleFactor / (distance + z2 * 0.4)

        return {
          px: x3 * scale + width / 2,
          py: y3 * scale + height / 2,
          pz: z2
        }
      })

      // Draw Edges
      ctx.lineWidth = 1.2
      edges.forEach((edge) => {
        const p1 = projected[edge.a]
        const p2 = projected[edge.b]

        // Calculate average Z depth for shading
        const avgZ = (p1.pz + p2.pz) / 2
        // Normal range for Z is [-1.0, 1.0]. Closer average Z is more negative (in front)
        const alpha = Math.max(0.08, Math.min(0.6, (1.2 - avgZ) / 2))

        ctx.beginPath()
        ctx.moveTo(p1.px, p1.py)
        ctx.lineTo(p2.px, p2.py)
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})` // sky-400 theme
        ctx.stroke()
      })

      // Draw Vertex Nodes
      projected.forEach((p) => {
        const activeHover = propHovered !== undefined ? propHovered : isHovered
        const alpha = Math.max(0.1, Math.min(0.85, (1.2 - p.pz) / 2))
        ctx.beginPath()
        ctx.arc(p.px, p.py, activeHover ? 3 : 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})` // indigo-400 theme
        ctx.fill()
      })

      frameId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      if (parent) {
        parent.removeEventListener('mouseenter', onEnter)
        parent.removeEventListener('mouseleave', onLeave)
      }
    }
  }, [shape, propHovered])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
