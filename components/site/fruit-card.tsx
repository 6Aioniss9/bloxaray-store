'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getRarityStyle, type Fruit } from '@/lib/fruits'
import { TiltCard } from '@/components/effects/tilt-card'

const RARITY_BG: Record<string, string> = {
  Mythical:  'from-red-950/60 via-red-900/20 to-transparent',
  Legendary: 'from-orange-950/50 via-amber-900/15 to-transparent',
  Rare:      'from-purple-950/40 via-purple-900/10 to-transparent',
  Common:    'from-zinc-950/30 via-zinc-900/5 to-transparent',
}

const AMBIENT_GLOW: Record<string, string> = {
  kitsune:          'from-cyan-500/15 via-blue-600/8 to-transparent',
  tiger:            'from-orange-500/15 via-yellow-600/8 to-transparent',
  yeti:             'from-sky-200/15 via-blue-300/8 to-transparent',
  'fiend-yeti':     'from-red-600/15 via-purple-800/8 to-transparent',
  lobo:             'from-violet-500/15 via-purple-600/8 to-transparent',
  'rumble-verde':   'from-green-400/15 via-emerald-600/8 to-transparent',
  'rumble-amarilla':'from-yellow-400/15 via-amber-600/8 to-transparent',
  'divine-portal':  'from-amber-200/15 via-yellow-400/8 to-transparent',
  'super-spirit-pain':'from-blue-400/15 via-indigo-600/8 to-transparent',
}

function Particles({ id }: { id: string }) {
  const dots = Array.from({ length: 5 }, (_, i) => ({
    x: 12 + (i * 41) % 76,
    y: 8 + (i * 29) % 64,
    size: 1.5 + (i % 3),
    delay: i * 0.9,
    duration: 3 + (i % 2) * 2,
  }))

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/15"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size }}
          animate={{ opacity: [0, 0.6, 0], y: [0, -12 - i * 4], scale: [0, 1, 0] }}
          transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export function FruitCard({ fruit, index = 0 }: { fruit: Fruit; index?: number }) {
  const rarity = getRarityStyle(fruit.rarity)
  const inStock = fruit.stock > 0
  const ambient = AMBIENT_GLOW[fruit.id] || AMBIENT_GLOW.kitsune
  const rarityBg = RARITY_BG[fruit.rarity] || RARITY_BG.Mythical
  const glowColor = rarity.glow

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <TiltCard>
        <article
          className="card-3d group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-black/60 transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_0_40px_-12px_rgba(239,35,60,0.35)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Scene */}
          <div className="relative h-[180px] w-full overflow-hidden sm:h-[200px] md:h-[220px]">
            <div className={`absolute inset-0 bg-gradient-to-b ${rarityBg}`} />
            <div className={`absolute inset-0 bg-gradient-to-b ${ambient}`} />

            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2">
              <div
                className="mx-auto aspect-square w-4/5 max-w-[200px] rounded-full blur-3xl transition-all duration-700 group-hover:scale-110 group-hover:opacity-90"
                style={{ background: glowColor }}
              />
            </div>

            <Particles id={fruit.id} />

            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src={fruit.image || '/placeholder.svg'}
                alt={fruit.name}
                width={418}
                height={418}
                className="h-full w-full object-cover transition-all duration-300 group-hover:scale-[1.06]"
                style={{ filter: 'contrast(1.03) brightness(1.02)', transformStyle: 'preserve-3d' }}
                priority
              />
            </div>

            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_0_rgba(0,0,0,0.5)]" />
            <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute left-3 top-3 z-10">
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-lg backdrop-blur-sm ${rarity.chip}`}>
                {rarity.label}
              </span>
            </div>

            <div className="absolute right-3 top-3 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 shadow-lg backdrop-blur-sm">
                <span className={`size-1.5 rounded-full ${inStock ? 'bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.3)]' : 'bg-zinc-600'}`} />
                {inStock ? `x${fruit.stock}` : 'Agotado'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 p-4 pt-2.5">
            <h3 className="text-base font-bold tracking-tight text-white">{fruit.name}</h3>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-extrabold text-white">
                  S/{fruit.price.toFixed(2)}
                </p>
                <p className="text-[11px] text-zinc-500">
                  ${fruit.priceUSD.toFixed(2)} USD
                </p>
              </div>
              <Link
                href={inStock ? `/fruta/${fruit.id}` : '#'}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                  inStock
                    ? 'bg-red-600 text-white shadow-[0_0_20px_-6px_rgba(239,35,60,0.4)] hover:bg-red-500 hover:shadow-[0_0_30px_-8px_rgba(239,35,60,0.6)]'
                    : 'cursor-not-allowed border border-white/10 bg-white/5 text-zinc-500'
                }`}
              >
                {inStock ? <Eye className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
                {inStock ? 'Ver detalle' : 'Agotado'}
              </Link>
            </div>
          </div>
        </article>
      </TiltCard>
    </motion.div>
  )
}
