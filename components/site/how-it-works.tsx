'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ShoppingCart, CreditCard, Package } from 'lucide-react'

const steps = [
  {
    paso: 'PASO 1',
    icon: ShoppingCart,
    title: 'Selecciona tu fruta',
    description: 'Elige entre nuestro stock de frutas fisicas. Todas con precio justo y stock actualizado.',
  },
  {
    paso: 'PASO 2',
    icon: CreditCard,
    title: 'Realiza el pago',
    description: 'Paga de forma segura con Binance, Yape, Plin o PayPal. Aprobacion inmediata.',
  },
  {
    paso: 'PASO 3',
    icon: Package,
    title: 'Recibe tu fruta',
    description: 'Te entregamos la fruta en el juego al instante. Sin esperas ni complicaciones.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 size-[500px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-red-500/8 blur-3xl" />
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
            Como funciona
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Compra en 3 pasos
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
            Comprar tu fruta favorita nunca fue tan facil.
          </p>
        </motion.div>

        <div ref={ref} className="relative mx-auto max-w-5xl">
          {inView && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[15%] right-[15%] top-[36px] hidden h-px origin-left md:block"
            >
              <div className="h-full w-full bg-gradient-to-r from-red-500/0 via-red-500/60 to-red-500/0 shadow-[0_0_12px_4px_rgba(239,35,60,0.2)]" />
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
          >
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.paso}
                  variants={itemVariants}
                  className="group relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full border border-red-500/30 bg-black/80 backdrop-blur-xl transition-all duration-300 group-hover:border-red-500/60 group-hover:shadow-[0_0_30px_-6px_rgba(239,35,60,0.35)]">
                    <div className="absolute inset-0 rounded-full bg-red-500/10 blur-md transition-all duration-300 group-hover:bg-red-500/20 group-hover:blur-xl" />
                    <span
                      className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full border border-red-500/30 bg-black text-[10px] font-bold text-red-400 backdrop-blur-xl"
                      style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                    >
                      {i + 1}
                    </span>
                    <Icon className="relative size-6 text-red-400 transition-all duration-300 group-hover:scale-110 group-hover:text-red-300" />
                  </div>

                  <span
                    className="mt-5 text-[11px] font-semibold tracking-[0.15em] text-red-400/70"
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {step.paso}
                  </span>

                  <h3
                    className="mt-1.5 text-lg font-bold text-white transition-colors duration-200 group-hover:text-red-300"
                    style={{ fontFamily: 'var(--font-heading), sans-serif' }}
                  >
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
