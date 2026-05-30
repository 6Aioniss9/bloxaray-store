'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { MessageCircle, ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DISCORD_URL } from '@/lib/fruits'

const stats = [
  { value: '40+', label: 'ENTREGAS' },
  { value: '5 - 20M', label: 'TIEMPO' },
  { value: '100%', label: 'SEGURO' },
]

const embers = Array.from({ length: 12 })

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-red-950/15 via-transparent to-red-950/15" />

      {embers.map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full mix-blend-screen"
          style={{
            width: `${1.5 + (i % 3) * 1}px`,
            height: `${1.5 + (i % 3) * 1}px`,
            left: `${55 + (i * 4.2) % 40}%`,
            top: `${30 + (i * 7.8) % 50}%`,
            background: i % 3 === 0 ? '#ff6b35' : '#ef233c',
            boxShadow: i % 3 === 0
              ? '0 0 6px 2px rgba(255,107,53,0.3)'
              : '0 0 6px 2px rgba(239,35,60,0.3)',
          }}
          animate={{
            y: [0, -(12 + (i % 5) * 6), 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * (3 + (i % 3) * 2), 0],
            opacity: [0.4, 0.9, 0.4],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 3.5 + (i % 4) * 1.2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute -top-24 left-1/4 size-[420px] -translate-x-1/2 rounded-full bg-gradient-to-br from-red-500/15 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 right-0 size-[380px] rounded-full bg-gradient-to-br from-orange-500/10 to-transparent blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <div className="absolute right-[15%] top-1/4 size-[300px] rounded-full bg-gradient-to-br from-red-500/20 via-orange-500/10 to-transparent blur-3xl" />
        <div className="absolute right-[5%] top-[40%] size-[200px] rounded-full bg-gradient-to-br from-orange-500/25 via-red-500/10 to-transparent blur-3xl" />
        <div className="absolute right-[25%] top-[20%] size-[120px] rounded-full bg-gradient-to-br from-red-500/15 to-transparent blur-2xl" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="relative">
          <motion.div
            variants={cardVariants}
            className="mx-auto w-fit max-w-[520px] sm:mx-0 sm:ml-[1%]"
          >
            <div className="rounded-[28px] border border-red-500/20 bg-black/50 p-5 backdrop-blur-2xl shadow-[0_0_60px_-12px_rgba(239,35,60,0.2)]">
              <motion.span
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-red-400"
              >
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-green-400" />
                </span>
                Stock actualizado diariamente
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 text-balance text-2xl font-extrabold leading-[0.95] tracking-tight text-white sm:text-3xl lg:text-4xl"
                style={{ fontFamily: 'var(--font-heading), sans-serif' }}
              >
                LAS MEJORES FRUTAS
                <br />
                DE{' '}
                <span className="text-red-500 drop-shadow-[0_0_12px_rgba(239,35,60,0.4)]">BLOX FRUITS</span>
                <br />
                A PRECIO ACCESIBLE
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-zinc-300"
              >
                Stock actualizado diariamente, entrega rapida y atencion
                personalizada.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="mt-5 flex flex-col gap-2.5 sm:flex-row"
              >
                <Button
                  asChild
                  size="default"
                  className="bg-red-600 text-white shadow-[0_0_24px_-6px_rgba(239,35,60,0.5)] transition-all duration-300 hover:scale-[1.03] hover:bg-red-500"
                >
                  <Link href="/stock">
                    Ver Stock
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="default"
                  variant="outline"
                  className="border-red-500/40 bg-black/30 text-white backdrop-blur transition-all duration-300 hover:bg-red-600/20 hover:text-white"
                >
                  <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                    <MessageCircle className="size-4" />
                    Comprar por Discord
                  </a>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.4 }}
                className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-zinc-300"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-green-400" /> Vendedor
                  verificado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="size-3.5 text-orange-400" /> Entrega inmediata
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 text-red-400" /> 5 estrellas
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="mt-5 flex items-center justify-center gap-8 border-t border-white/5 pt-5"
              >
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center text-center">
                    <span className="text-lg font-extrabold leading-none text-white drop-shadow-[0_0_8px_rgba(239,35,60,0.2)]">
                      {s.value}
                    </span>
                    <span className="mt-0.5 text-[10px] font-semibold tracking-[0.1em] text-zinc-500">
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
