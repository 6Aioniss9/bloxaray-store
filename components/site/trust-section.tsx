'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { Star } from 'lucide-react'

const stats = [
  { value: 40, suffix: '+', label: 'ENTREGAS' },
  { value: null, label: 'TIEMPO PROMEDIO', text: '5 - 20M' },
  { value: 100, suffix: '%', label: 'SEGURO' },
]

const payments = [
  { name: 'Binance', symbol: 'B' },
  { name: 'Yape', symbol: 'Y' },
  { name: 'Plin', symbol: 'P' },
  { name: 'PayPal', symbol: 'Pp' },
]

function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: 2,
        ease: 'easeOut',
        onUpdate: (v) => setDisplay(Math.round(v)),
      })
      return controls.stop
    }
  }, [inView, value])

  return (
    <span ref={ref} className="text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl">
      {display}{suffix}
    </span>
  )
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function TrustSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 size-[400px] -translate-x-1/3 rounded-full bg-red-500/8 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 size-[350px] translate-x-1/3 rounded-full bg-orange-500/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Confianza
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Compra con tranquilidad
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
            Miles de clientes satisfechos nos respaldan.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto mb-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div
              key={s.label}
              variants={itemVariants}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 py-8 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_30px_-10px_rgba(239,35,60,0.15)]"
            >
              {s.value !== null ? (
                <Counter value={s.value} suffix={s.suffix} />
              ) : (
                <span className="text-4xl font-extrabold leading-none tracking-tight text-white sm:text-5xl">
                  {s.text}
                </span>
              )}
              <span className="mt-2 text-[11px] font-semibold tracking-[0.1em] text-zinc-500">
                {s.label}
              </span>
            </motion.div>
          ))}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/40 px-4 py-8 backdrop-blur-sm transition-all duration-300 hover:border-red-500/30 hover:shadow-[0_0_30px_-10px_rgba(239,35,60,0.15)]"
          >
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 400, damping: 12 }}
                >
                  <Star className="size-5 fill-red-500 text-red-500" />
                </motion.span>
              ))}
            </div>
            <span className="mt-2 text-[11px] font-semibold tracking-[0.1em] text-zinc-500">
              VALORACION
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <p className="mb-5 text-center text-sm font-medium text-zinc-400">
            Metodos de pago aceptados
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {payments.map((p) => (
              <motion.div
                key={p.name}
                whileHover={{ scale: 1.04, y: -2 }}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-sm transition-all duration-200 hover:border-red-500/30 hover:shadow-[0_0_24px_-8px_rgba(239,35,60,0.2)]"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/15 text-xs font-bold text-red-400">
                  {p.symbol}
                </div>
                <span className="text-sm font-medium text-zinc-300">{p.name}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-600">
            Tus datos estan protegidos. Compra 100% segura.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
