'use client'

import { useEffect, useRef } from 'react'

interface Point3D {
  x: number
  y: number
  z: number
}

export default function Interactive3DGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleYRef = useRef(0)
  const angleXRef = useRef(0.1) // Constant tilt
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement

    const resize = () => {
      canvas.width = parent ? parent.clientWidth : 300
      canvas.height = parent ? parent.clientHeight : 300
    }
    resize()

    const ro = new ResizeObserver(resize)
    if (parent) ro.observe(parent)

    // Handle mouse movement for globe rotation influence
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - canvas.width / 2
      const my = e.clientY - rect.top - canvas.height / 2

      // Map mouse position to target angles
      mouseRef.current.targetX = mx * 0.003
      mouseRef.current.targetY = my * 0.003
    }

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0
      mouseRef.current.targetY = 0
    }

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
    }

    // Globe configuration
    const GLOBE_RADIUS = 95
    const LATITUDES = 11
    const LONGITUDES = 16
    const FOCAL_LENGTH = 300

    let frameId = 0
    let orbitTime = 0

    // Precalculate sphere coordinates
    const spherePoints: Point3D[] = []
    for (let lat = 1; lat < LATITUDES; lat++) {
      const phi = (lat * Math.PI) / LATITUDES
      for (let lon = 0; lon < LONGITUDES; lon++) {
        const theta = (lon * 2 * Math.PI) / LONGITUDES
        const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
        const y = GLOBE_RADIUS * Math.cos(phi)
        const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
        spherePoints.push({ x, y, z })
      }
    }
    // Add poles
    spherePoints.push({ x: 0, y: GLOBE_RADIUS, z: 0 })
    spherePoints.push({ x: 0, y: -GLOBE_RADIUS, z: 0 })

    const draw = () => {
      orbitTime += 0.012
      angleYRef.current += 0.0045 // Constant rotation speed
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse interpolation
      mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.05
      mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.05

      // Final pitch/yaw angles
      const yaw = angleYRef.current + mouseRef.current.currentX
      const pitch = angleXRef.current + mouseRef.current.currentY

      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosP = Math.cos(pitch)
      const sinP = Math.sin(pitch)

      // Projection helper
      const project = (pt: Point3D) => {
        // Rotate Yaw (Y-axis)
        const x1 = pt.x * cosY - pt.z * sinY
        const z1 = pt.z * cosY + pt.x * sinY

        // Rotate Pitch (X-axis)
        const y2 = pt.y * cosP - z1 * sinP
        const z2 = z1 * cosP + pt.y * sinP

        // Translation
        const finalZ = z2 + 320
        const scale = FOCAL_LENGTH / finalZ
        const px = x1 * scale + canvas.width / 2
        const py = y2 * scale + canvas.height / 2
        const alpha = Math.max(0.08, Math.min(0.75, (450 - finalZ) / 200))

        return { px, py, pz: finalZ, scale, alpha }
      }

      // 1. PROJECT SPHERE POINTS
      const projectedGlobePoints = spherePoints.map(project)

      // Separate into back and front points (painter's sort)
      const pointsToDraw = projectedGlobePoints.map((pt, idx) => ({ ...pt, idx }))
      pointsToDraw.sort((a, b) => b.pz - a.pz)

      // Draw points
      pointsToDraw.forEach((pt) => {
        // Dot sizes: slightly larger if closer
        const dotSize = pt.pz < 320 ? 2.2 : 1.4
        ctx.beginPath()
        ctx.arc(pt.px, pt.py, dotSize * pt.scale, 0, Math.PI * 2)
        ctx.fillStyle = pt.pz < 320 ? '#38bdf8' : '#818cf8' // Sky-400 (front) or Indigo-400 (back)
        ctx.globalAlpha = pt.alpha
        ctx.fill()
      })

      // 2. PROJECT AND DRAW SATELLITE ORBIT RINGS
      // We will define 2 circular orbits at slightly larger radii
      const ORBIT_RADIUS = GLOBE_RADIUS * 1.3
      const orbits = [
        // Orbit 1: Tilted horizontally
        { axisX: 0.25, axisY: 0.15, axisZ: 0.4, color: 'rgba(56, 189, 248, ', speedOffset: 0 },
        // Orbit 2: Tilted vertically
        { axisX: -0.3, axisY: 0.45, axisZ: 0.2, color: 'rgba(192, 132, 252, ', speedOffset: Math.PI / 2 }
      ]

      orbits.forEach((orbit) => {
        // Draw orbit ring by projecting circular segments
        const segments = 45
        const ringPoints: Point3D[] = []
        for (let i = 0; i <= segments; i++) {
          const theta = (i * 2 * Math.PI) / segments
          // Circular orbit path in plane
          let ox = ORBIT_RADIUS * Math.cos(theta)
          let oy = 0
          let oz = ORBIT_RADIUS * Math.sin(theta)

          // Tilt the orbit plane relative to the globe
          // Tilt around X
          const oy1 = oy * Math.cos(orbit.axisX) - oz * Math.sin(orbit.axisX)
          const oz1 = oz * Math.cos(orbit.axisX) + oy * Math.sin(orbit.axisX)

          // Tilt around Z
          const ox2 = ox * Math.cos(orbit.axisZ) - oy1 * Math.sin(orbit.axisZ)
          const oy2 = oy1 * Math.cos(orbit.axisZ) + ox * Math.sin(orbit.axisZ)

          ringPoints.push({ x: ox2, y: oy2, z: oz1 })
        }

        const projectedRing = ringPoints.map(project)

        // Draw segments of the ring
        ctx.lineWidth = 0.8
        for (let i = 0; i < segments; i++) {
          const pt1 = projectedRing[i]
          const pt2 = projectedRing[i + 1]
          const avgAlpha = (pt1.alpha + pt2.alpha) / 2
          ctx.beginPath()
          ctx.moveTo(pt1.px, pt1.py)
          ctx.lineTo(pt2.px, pt2.py)
          ctx.strokeStyle = `${orbit.color}${avgAlpha * 0.35})`
          ctx.stroke()
        }

        // Draw rotating satellite node along this orbit
        const satAngle = orbitTime + orbit.speedOffset
        let sx = ORBIT_RADIUS * Math.cos(satAngle)
        let sy = 0
        let sz = ORBIT_RADIUS * Math.sin(satAngle)

        // Tilt satellite coordinate
        const sy1 = sy * Math.cos(orbit.axisX) - sz * Math.sin(orbit.axisX)
        const sz1 = sz * Math.cos(orbit.axisX) + sy * Math.sin(orbit.axisX)

        const sx2 = sx * Math.cos(orbit.axisZ) - sy1 * Math.sin(orbit.axisZ)
        const sy2 = sy1 * Math.cos(orbit.axisZ) + sx * Math.sin(orbit.axisZ)

        const satProj = project({ x: sx2, y: sy2, z: sz1 })

        // Glowing outer circle for satellite
        ctx.beginPath()
        ctx.arc(satProj.px, satProj.py, 5 * satProj.scale, 0, Math.PI * 2)
        ctx.fillStyle = `${orbit.color}${satProj.alpha * 0.25})`
        ctx.fill()

        // Inner solid core
        ctx.beginPath()
        ctx.arc(satProj.px, satProj.py, 2.2 * satProj.scale, 0, Math.PI * 2)
        ctx.fillStyle = satProj.pz < 320 ? '#38bdf8' : '#c084fc'
        ctx.globalAlpha = satProj.alpha
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
        parent.removeEventListener('mouseleave', handleMouseLeave)
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
