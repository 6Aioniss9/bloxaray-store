'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function LoadingScreen() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = 60
    const id = setInterval(() => {
      frame++
      const p = Math.min(frame / totalFrames, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(id)
        setTimeout(() => setLoading(false), 400)
      }
    }, 20)

    const safety = setTimeout(() => setLoading(false), 5000)

    return () => {
      clearInterval(id)
      clearTimeout(safety)
    }
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#050510]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-red-500/10"
                style={{
                  left: `${10 + (i * 37) % 80}%`,
                  top: `${10 + (i * 23) % 80}%`,
                  width: 2 + (i % 2) * 2,
                  height: 2 + (i % 2) * 2,
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -20 - i * 3],
                }}
                transition={{
                  duration: 2.5 + (i % 3),
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-12"
          >
            <img
              src="/logo.png"
              alt="BLOXARAY"
              className="h-auto w-[180px] sm:w-[220px] md:w-[280px]"
            />
            <div
              className="absolute -inset-8 -z-10 rounded-full blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(239,35,60,0.15) 0%, transparent 70%)',
              }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-[200px]"
          >
            <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-red-500"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(239,35,60,0.5), transparent)',
                  transform: `translateX(${progress * 200 - 100}%)`,
                  transition: 'transform 0.1s linear',
                }}
              />
            </div>
            <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">
              {Math.round(progress * 100)}%
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="absolute bottom-12 text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-700"
          >
            Cargando...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
