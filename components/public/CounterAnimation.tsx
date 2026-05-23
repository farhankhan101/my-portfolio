'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterAnimationProps {
  /** Final number to count to */
  to: number
  /** Duration in ms */
  duration?: number
  /** Suffix e.g. "+" or "%" */
  suffix?: string
  /** Prefix e.g. "$" */
  prefix?: string
  className?: string
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export default function CounterAnimation({
  to,
  duration = 1800,
  suffix = '',
  prefix = '',
  className = '',
}: CounterAnimationProps) {
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    const startTime = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(progress)
      setValue(Math.round(eased * to))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, to, duration])

  return (
    <span ref={elementRef} className={className}>
      {prefix}{value}{suffix}
    </span>
  )
}
