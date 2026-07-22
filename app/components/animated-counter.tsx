'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  target: number        // número final
  duration?: number     // duración en ms, default 1800
  suffix?: string       // ej: '+', '%'
  prefix?: string       // ej: '$'
}

export function AnimatedCounter({
  target,
  duration = 1800,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Detectar cuando el elemento entra en el viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  // Animar el contador cuando empieza
  useEffect(() => {
    if (!started) return

    const startTime = performance.now()
    const startValue = 0

    // Easing suave: easeOutQuart
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(progress)
      const current = Math.round(startValue + (target - startValue) * easedProgress)
      setCount(current)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [started, target, duration])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}
