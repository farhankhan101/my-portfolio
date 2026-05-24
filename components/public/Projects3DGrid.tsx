'use client'

import { useEffect, useRef } from 'react'

export default function Projects3DGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const angleXRef = useRef(-0.4) // Pitch tilt
  const angleYRef = useRef(0.2)   // Yaw tilt
  const mouseRef = useRef({ targetX: 0.2, targetY: -0.4, currentX: 0.2, currentY: -0.4 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const parent = canvas.parentElement

    const resize = () => {
      canvas.width = parent ? parent.clientWidth : window.innerWidth
      canvas.height = parent ? parent.clientHeight : 350
    }
    resize()

    const ro = new ResizeObserver(resize)
    if (parent) ro.observe(parent)

    // Handle mouse movement to tilt grid
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left - canvas.width / 2
      const my = e.clientY - rect.top - canvas.height / 2

      // Map mouse position to target rotations
      mouseRef.current.targetX = mx * 0.001
      mouseRef.current.targetY = my * 0.0008
    }

    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
    }

    // Grid configuration
    const COLS = 22
    const ROWS = 14
    const FOCAL_LENGTH = 340

    let frameId = 0
    let time = 0

    const draw = () => {
      time += 0.015
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smoothly interpolate current angles towards target angles
      mouseRef.current.currentX += (mouseRef.current.targetX - mouseRef.current.currentX) * 0.05
      mouseRef.current.currentY += (mouseRef.current.targetY - mouseRef.current.currentY) * 0.05

      // Combine base tilt and mouse tilt
      const yaw = angleYRef.current + mouseRef.current.currentX
      const pitch = angleXRef.current + mouseRef.current.currentY

      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosP = Math.cos(pitch)
      const sinP = Math.sin(pitch)

      // Dynamically calculate grid cell sizing to stretch across full container width/height
      const cellWidth = Math.max(35, (canvas.width * 1.25) / (COLS - 1))
      const cellHeight = Math.max(30, (canvas.height * 1.45) / (ROWS - 1))

      const startX = -((COLS - 1) * cellWidth) / 2
      const startY = -((ROWS - 1) * cellHeight) / 2

      const projected: { px: number; py: number; pz: number; alpha: number }[][] = []

      for (let r = 0; r < ROWS; r++) {
        projected[r] = []
        for (let c = 0; c < COLS; c++) {
          // Calculate grid node coordinates in 3D
          const gridX = startX + c * cellWidth
          const gridY = startY + r * cellHeight
          
          // Flow height (Z coordinate) using undulating wave
          // Add spatial variation and temporal shift
          const distFromCenter = Math.sqrt(gridX * gridX + gridY * gridY)
          const gridZ = Math.sin(distFromCenter * 0.007 - time) * 28 + 
                        Math.cos(c * 0.35 + time) * 12

          // Rotate around Pitch (X-axis)
          const y1 = gridY * cosP - gridZ * sinP
          const z1 = gridZ * cosP + gridY * sinP

          // Rotate around Yaw (Y-axis)
          const x2 = gridX * cosY - z1 * sinY
          const z2 = z1 * cosY + gridX * sinY

          // Shift grid back in depth so it is in front of camera
          const finalZ = z2 + 480

          // Perspective projection
          const scale = FOCAL_LENGTH / finalZ
          const px = x2 * scale + canvas.width / 2
          const py = y1 * scale + canvas.height / 2

          // Smooth feather/fade near canvas borders to eliminate harsh diverging perspective grid lines at corners
          const borderFadeX = Math.min(
            px < 0 ? 0 : px / (canvas.width * 0.16),
            (canvas.width - px) < 0 ? 0 : (canvas.width - px) / (canvas.width * 0.16)
          )
          const borderFadeY = Math.min(
            py < 0 ? 0 : py / (canvas.height * 0.16),
            (canvas.height - py) < 0 ? 0 : (canvas.height - py) / (canvas.height * 0.16)
          )
          const borderFade = Math.max(0, Math.min(1, borderFadeX * borderFadeY))

          // Compute final opacity based on depth (Z distance) and border feathering
          const alpha = Math.max(0.0, Math.min(0.6, ((650 - finalZ) / 380) * borderFade))

          projected[r][c] = { px, py, pz: finalZ, alpha }
        }
      }

      // Draw Grid Lines
      ctx.lineWidth = 1.0

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const current = projected[r][c]

          // Connect to right neighbor
          if (c < COLS - 1) {
            const right = projected[r][c + 1]
            const avgAlpha = (current.alpha + right.alpha) / 2
            ctx.beginPath()
            ctx.moveTo(current.px, current.py)
            ctx.lineTo(right.px, right.py)
            ctx.strokeStyle = `rgba(56, 189, 248, ${avgAlpha * 0.7})` // sky-400 theme
            ctx.stroke()
          }

          // Connect to bottom neighbor
          if (r < ROWS - 1) {
            const bottom = projected[r + 1][c]
            const avgAlpha = (current.alpha + bottom.alpha) / 2
            ctx.beginPath()
            ctx.moveTo(current.px, current.py)
            ctx.lineTo(bottom.px, bottom.py)
            ctx.strokeStyle = `rgba(129, 140, 248, ${avgAlpha * 0.7})` // indigo-400 theme
            ctx.stroke()
          }
        }
      }

      // Draw Grid Intersections (Nodes)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const pt = projected[r][c]
          ctx.beginPath()
          ctx.arc(pt.px, pt.py, 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(129, 140, 248, ${pt.alpha})`
          ctx.fill()
        }
      }

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
