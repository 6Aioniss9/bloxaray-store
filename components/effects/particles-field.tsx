'use client'

import { motion } from 'framer-motion'

function Particle({ index }: { index: number }) {
  const seed = index * 137.5
  const x = ((Math.sin(seed) * 0.5 + 0.5) * 100).toFixed(4)
  const y = ((Math.cos(seed * 1.3) * 0.5 + 0.5) * 100).toFixed(4)
  const size = (1 + (index % 3) * 0.8).toFixed(1)
  const duration = 12 + (index % 5) * 4
  const delay = index * 1.2

  return (
    <motion.div
      className="absolute rounded-full bg-white/8"
      style={{ left: `${x}%`, top: `${y}%`, width: `${size}px`, height: `${size}px` }}
      animate={{
        opacity: [0, 0.4, 0],
        y: [0, -30 - (index % 10) * 5],
        x: [0, (index % 2 === 0 ? 1 : -1) * (10 + (index % 6) * 3)],
        scale: [0, 1, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export function ParticlesField({ count = 24 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <Particle key={i} index={i} />
      ))}
    </div>
  )
}
