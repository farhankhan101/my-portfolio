'use client'

import { useEffect, useRef, useState } from 'react'

interface TypewriterTextProps {
  texts: string[]
  /** ms per character typed */
  typeSpeed?: number
  /** ms pause before deleting */
  pauseMs?: number
  /** ms per character deleted */
  deleteSpeed?: number
  className?: string
}

export default function TypewriterText({
  texts,
  typeSpeed = 60,
  pauseMs = 1800,
  deleteSpeed = 35,
  className = '',
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing')
  const [textIdx, setTextIdx] = useState(0)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (texts.length === 0) return
    const current = texts[textIdx]

    const clear = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    if (phase === 'typing') {
      if (displayed.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1))
        }, typeSpeed)
      } else {
        timeoutRef.current = setTimeout(() => setPhase('pausing'), pauseMs)
      }
    } else if (phase === 'pausing') {
      timeoutRef.current = setTimeout(() => setPhase('deleting'), 200)
    } else if (phase === 'deleting') {
      if (displayed.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1))
        }, deleteSpeed)
      } else {
        setTextIdx((prev) => (prev + 1) % texts.length)
        setPhase('typing')
      }
    }

    return clear
  }, [displayed, phase, textIdx, texts, typeSpeed, pauseMs, deleteSpeed])

  return (
    <span className={className} aria-label={texts[textIdx]}>
      {displayed}
      <span
        className="inline-block w-[2px] h-[1em] ml-0.5 align-middle bg-sky-500 dark:bg-sky-400 animate-blink"
        aria-hidden="true"
      />
    </span>
  )
}
