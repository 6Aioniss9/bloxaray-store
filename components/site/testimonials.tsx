'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'

const testimonials = [
  {
    name: 'Carlos M.',
    avatar: 'C',
    text: 'Increible servicio. Compre Kitsune y en menos de 5 minutos ya la tenia en el juego. Muy recomendado.',
    rating: 5,
  },
  {
    name: 'Luis R.',
    avatar: 'L',
    text: 'La mejor tienda de frutas de Blox Fruits. Precios justos y atencion rapida por Discord. Volvere a comprar.',
    rating: 5,
  },
  {
    name: 'Andres G.',
    avatar: 'A',
    text: 'Pense que era una estafa pero resulto ser todo legitimo. Ya compre 3 veces y siempre cumplen. 10/10.',
    rating: 5,
  },
  {
    name: 'Sofia P.',
    avatar: 'S',
    text: 'Compre Dragon para mi hijo y la atencion fue increible. Me guiaron en todo el proceso. Muy agradecido.',
    rating: 5,
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(next, 4000)
    return () => clearInterval(interval)
  }, [paused, next])

  const t = testimonials[current]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 size-[350px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 size-[300px] translate-x-1/3 translate-y-1/4 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Resenas
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <div
          className="mx-auto max-w-2xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative min-h-[260px] rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_40px_-12px_rgba(239,35,60,0.15)]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.08, type: 'spring', stiffness: 400, damping: 12 }}
                    >
                      <Star className="size-5 fill-red-500 text-red-500" />
                    </motion.span>
                  ))}
                </div>

                <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-200">
                  &ldquo;{t.text}&rdquo;
                </p>

                <div className="mt-6 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-red-500/20 text-sm font-bold text-red-400">
                    {t.avatar}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <BadgeCheck className="size-3.5 text-red-400" />
                    </div>
                    <p className="text-xs text-zinc-500">Comprador verificado</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setDirection(i > current ? 1 : -1)
                    setCurrent(i)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-6 bg-red-500 shadow-[0_0_8px_2px_rgba(239,35,60,0.3)]'
                      : 'w-1.5 bg-zinc-600 hover:bg-zinc-500'
                  }`}
                  aria-label={`Ir a reseña ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-1.5 text-zinc-400 backdrop-blur transition-all duration-200 hover:border-red-500/30 hover:text-red-400 hover:shadow-[0_0_16px_-6px_rgba(239,35,60,0.3)]"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-1.5 text-zinc-400 backdrop-blur transition-all duration-200 hover:border-red-500/30 hover:text-red-400 hover:shadow-[0_0_16px_-6px_rgba(239,35,60,0.3)]"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
