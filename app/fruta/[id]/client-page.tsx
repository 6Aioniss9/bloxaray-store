'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Zap, ArrowLeft, Check, Package } from 'lucide-react'
import { getRarityStyle, type Fruit, type Rarity } from '@/lib/fruits'
import { addToCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'
import { getCurrency, setCurrency, subscribe, type Currency } from '@/lib/currency-store'

const RARITY_BG: Record<string, string> = {
  Mythical:  'from-red-950/60 via-red-900/20 to-transparent',
  Legendary: 'from-fuchsia-950/50 via-fuchsia-900/15 to-transparent',
  Rare:      'from-purple-950/40 via-purple-900/10 to-transparent',
  Uncommon:  'from-cyan-950/40 via-cyan-900/10 to-transparent',
  Common:    'from-zinc-950/30 via-zinc-900/5 to-transparent',
}

const AMBIENT_GLOW: Record<string, string> = {
  rocket:           'from-orange-400/15 via-red-500/8 to-transparent',
  spin:             'from-cyan-400/15 via-blue-500/8 to-transparent',
  blade:            'from-slate-300/15 via-zinc-400/8 to-transparent',
  spring:           'from-green-400/15 via-emerald-500/8 to-transparent',
  bomb:             'from-red-500/15 via-orange-600/8 to-transparent',
  smoke:            'from-zinc-400/15 via-zinc-600/8 to-transparent',
  spike:            'from-orange-600/15 via-red-700/8 to-transparent',
  flame:            'from-orange-500/15 via-red-600/8 to-transparent',
  ice:              'from-sky-200/15 via-blue-300/8 to-transparent',
  sand:             'from-yellow-500/15 via-amber-700/8 to-transparent',
  dark:             'from-violet-900/15 via-purple-950/8 to-transparent',
  eagle:            'from-amber-500/15 via-orange-600/8 to-transparent',
  diamond:          'from-sky-200/15 via-blue-300/8 to-transparent',
  light:            'from-yellow-200/15 via-amber-300/8 to-transparent',
  rubber:           'from-yellow-400/15 via-orange-500/8 to-transparent',
  ghost:            'from-purple-400/15 via-violet-600/8 to-transparent',
  magma:            'from-orange-700/15 via-red-800/8 to-transparent',
  quake:            'from-amber-600/15 via-orange-800/8 to-transparent',
  buddha:           'from-amber-300/15 via-orange-400/8 to-transparent',
  love:             'from-pink-400/15 via-rose-600/8 to-transparent',
  creation:         'from-pink-400/15 via-rose-600/8 to-transparent',
  spider:           'from-purple-700/15 via-zinc-800/8 to-transparent',
  sound:            'from-teal-400/15 via-cyan-600/8 to-transparent',
  phoenix:          'from-orange-500/15 via-red-600/8 to-transparent',
  portal:           'from-purple-500/15 via-fuchsia-600/8 to-transparent',
  lightning:        'from-yellow-300/15 via-amber-400/8 to-transparent',
  pain:             'from-red-700/15 via-purple-900/8 to-transparent',
  blizzard:         'from-cyan-300/15 via-blue-400/8 to-transparent',
  gravity:          'from-purple-700/15 via-indigo-900/8 to-transparent',
  mammoth:          'from-orange-700/15 via-amber-800/8 to-transparent',
  't-rex':          'from-green-600/15 via-emerald-800/8 to-transparent',
  dough:            'from-pink-200/15 via-orange-300/8 to-transparent',
  shadow:           'from-zinc-800/15 via-black/8 to-transparent',
  venom:            'from-green-500/15 via-emerald-700/8 to-transparent',
  gas:              'from-lime-500/15 via-green-700/8 to-transparent',
  spirit:           'from-blue-400/15 via-indigo-600/8 to-transparent',
  tiger:            'from-orange-500/15 via-yellow-600/8 to-transparent',
  yeti:             'from-sky-200/15 via-blue-300/8 to-transparent',
  kitsune:          'from-cyan-500/15 via-blue-600/8 to-transparent',
  control:          'from-fuchsia-500/15 via-purple-600/8 to-transparent',
  dragon:           'from-red-600/15 via-orange-800/8 to-transparent',
}

export function FruitDetailClient({ fruit }: { fruit: Fruit }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [currency, setCurr] = useState<Currency>('PEN')

  useEffect(() => {
    setCurr(getCurrency())
    return subscribe(() => setCurr(getCurrency()))
  }, [])

  const rarity = getRarityStyle(fruit.rarity as Rarity)
  const inStock = fruit.stock > 0
  const ambient = AMBIENT_GLOW[fruit.id] || 'from-cyan-500/15 via-blue-600/8 to-transparent'
  const rarityBg = RARITY_BG[fruit.rarity] || RARITY_BG.Mythical

  const handleAddToCart = () => {
    addToCart({ fruitId: fruit.id, name: fruit.name, image: fruit.image, price: fruit.price, priceUSD: fruit.priceUSD, maxStock: fruit.stock, quantity })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart({ fruitId: fruit.id, name: fruit.name, image: fruit.image, price: fruit.price, priceUSD: fruit.priceUSD, maxStock: fruit.stock, quantity })
    router.push('/checkout')
  }

  return (
    <main className="relative min-h-screen bg-[#050510] pt-28 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/backgrounds/pueblo.png')] bg-cover bg-center bg-fixed" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link href="/stock" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-red-400">
          <ArrowLeft className="size-4" /> Volver al stock
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40">
              <div className={`absolute inset-0 bg-gradient-to-b ${rarityBg}`} />
              <div className={`absolute inset-0 bg-gradient-to-b ${ambient}`} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="size-80 rounded-full blur-3xl" style={{ background: rarity.glow }} />
              </div>
              <div className="relative flex aspect-square items-center justify-center p-8">
                <Image src={fruit.image} alt={fruit.name} width={418} height={418} className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105" priority />
              </div>
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_0_rgba(0,0,0,0.6)]" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col gap-6">
            <div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${rarity.chip}`}>{rarity.label}</span>
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>{fruit.name}</h1>
            <p className="text-lg leading-relaxed text-zinc-300">{fruit.blurb}</p>

            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-black text-white">
                {currency === 'USD' ? `$${fruit.priceUSD.toFixed(2)}` : `S/${fruit.price.toFixed(2)}`}
              </p>
              <button
                onClick={() => setCurrency(currency === 'PEN' ? 'USD' : 'PEN')}
                className="text-lg text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {currency === 'USD' ? `S/${fruit.price.toFixed(2)}` : `$${fruit.priceUSD.toFixed(2)}`}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${inStock ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.3)]' : 'bg-zinc-600'}`} />
              <span className={`text-sm font-semibold ${inStock ? 'text-green-400' : 'text-zinc-500'}`}>
                {inStock ? `${fruit.stock} en stock` : 'Agotado'}
              </span>
            </div>

            <div className="h-px bg-gradient-to-r from-red-500/30 via-red-500/10 to-transparent" />

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-400">Cantidad</p>
              <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.1] bg-black/40 p-1">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"><Minus className="size-4" /></button>
                <span className="flex w-14 items-center justify-center text-lg font-bold text-white">{quantity}</span>
                <button type="button" onClick={() => setQuantity(Math.min(fruit.stock, quantity + 1))} disabled={quantity >= fruit.stock} className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"><Plus className="size-4" /></button>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">Máximo: {fruit.stock} unidades</p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm text-zinc-400">Subtotal</p>
              <p className="text-2xl font-black text-white">
                {currency === 'USD' ? `$${(fruit.priceUSD * quantity).toFixed(2)}` : `S/{(fruit.price * quantity).toFixed(2)}`}
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  {currency === 'USD' ? `S/{(fruit.price * quantity).toFixed(2)}` : `$${(fruit.priceUSD * quantity).toFixed(2)}`}
                </span>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" disabled={!inStock} onClick={handleAddToCart} className={`flex-1 rounded-xl border text-base font-bold transition-all ${added ? 'border-green-500/50 bg-green-600 text-white shadow-[0_0_20px_-8px_rgba(34,197,94,0.4)]' : 'border-red-500/40 bg-red-600 text-white shadow-[0_0_25px_-10px_rgba(239,35,60,0.4)] hover:bg-red-500 hover:shadow-[0_0_35px_-12px_rgba(239,35,60,0.6)]'}`}>
                {added ? <><Check className="size-5" /> Agregado</> : <><ShoppingCart className="size-5" /> Agregar al carrito</>}
              </Button>
              <Button size="lg" disabled={!inStock} onClick={handleBuyNow} className="btn-glow flex-1 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-600 to-red-600 text-base font-bold text-white shadow-[0_0_25px_-10px_rgba(239,35,60,0.3)] transition-all hover:from-orange-500 hover:to-red-500 hover:shadow-[0_0_35px_-12px_rgba(239,35,60,0.5)]">
                <Zap className="size-5" /> Comprar ahora
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2"><Package className="size-4 text-red-400" /><span className="text-xs text-zinc-400">Envío rápido</span></div>
              <div className="flex items-center gap-2"><Check className="size-4 text-red-400" /><span className="text-xs text-zinc-400">Stock verificado</span></div>
              <div className="flex items-center gap-2"><ShoppingCart className="size-4 text-red-400" /><span className="text-xs text-zinc-400">Pago seguro</span></div>
              <div className="flex items-center gap-2"><Package className="size-4 text-red-400" /><span className="text-xs text-zinc-400">Soporte 24/7</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
