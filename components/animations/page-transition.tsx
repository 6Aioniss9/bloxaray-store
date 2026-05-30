'use client'

import { useEffect, useState, type ReactNode } from 'react'

export function PageTransition({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setReady(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={ready ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}
      style={{ willChange: 'opacity' }}
    >
      {children}
    </div>
  )
}
