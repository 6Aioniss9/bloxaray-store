'use client'

import { useEffect, useRef } from 'react'

export function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const div = ref.current
    if (!div) return
    let t = 0
    const id = setInterval(() => {
      t += 0.002
      const x = 40 + Math.sin(t * 0.7) * 10
      const y = 40 + Math.cos(t * 0.5) * 10
      div.style.setProperty('--nebula-x', `${x}%`)
      div.style.setProperty('--nebula-y', `${y}%`)
    }, 50)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Layer 1 — deep gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0515] to-[#050510]" />

      {/* Layer 2 — animated nebula */}
      <div
        ref={ref}
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(600px circle at var(--nebula-x, 50%) var(--nebula-y, 50%), rgba(239,35,60,0.08) 0%, transparent 70%),' +
            'radial-gradient(400px circle at calc(100% - var(--nebula-x, 50%)) calc(100% - var(--nebula-y, 50%)), rgba(100,50,200,0.05) 0%, transparent 60%)',
          transition: 'background 2s ease',
        }}
      />

      {/* Layer 3 — subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Layer 4 — radial spotlight */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 opacity-20"
        style={{
          width: '800px',
          height: '600px',
          background:
            'radial-gradient(ellipse at center, rgba(239,35,60,0.06) 0%, transparent 60%)',
        }}
      />

      {/* Layer 5 — film grain */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Layer 6 — subtle ambient glow edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050510]/80 via-transparent to-[#050510]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050510]/60 via-transparent to-[#050510]/60" />
    </div>
  )
}
