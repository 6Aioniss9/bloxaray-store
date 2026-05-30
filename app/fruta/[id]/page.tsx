'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Zap, ArrowLeft, Check, Package } from 'lucide-react'
import { fruits, getRarityStyle, type Rarity } from '@/lib/fruits'
import { addToCart } from '@/lib/cart-store'
import { Button } from '@/components/ui/button'

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

export default function FruitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const fruit = useMemo(() => fruits.find((f) => f.id === id), [id])

  if (!fruit) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050510] pt-24">
        <div className="text-center">
          <p className="text-2xl font-bold text-white">Fruta no encontrada</p>
          <Link href="/stock" className="mt-4 inline-flex items-center gap-2 text-red-400 hover:text-red-300">
            <ArrowLeft className="size-4" /> Volver al stock
          </Link>
        </div>
      </main>
    )
  }

  const rarity = getRarityStyle(fruit.rarity)
  const inStock = fruit.stock > 0
  const ambient = AMBIENT_GLOW[fruit.id] || AMBIENT_GLOW.kitsune
  const rarityBg = RARITY_BG[fruit.rarity] || RARITY_BG.Mythical

  const handleAddToCart = () => {
    addToCart({
      fruitId: fruit.id,
      name: fruit.name,
      image: fruit.image,
      price: fruit.price,
      priceUSD: fruit.priceUSD,
      maxStock: fruit.stock,
      quantity,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addToCart({
      fruitId: fruit.id,
      name: fruit.name,
      image: fruit.image,
      price: fruit.price,
      priceUSD: fruit.priceUSD,
      maxStock: fruit.stock,
      quantity,
    })
    router.push('/checkout')
  }

  return (
    <main className="relative min-h-screen bg-[#050510] pt-28 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[url('/backgrounds/pueblo.png')] bg-cover bg-center bg-fixed" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/60" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/stock"
          className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-red-400"
        >
          <ArrowLeft className="size-4" /> Volver al stock
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-black/40">
              <div className={`absolute inset-0 bg-gradient-to-b ${rarityBg}`} />
              <div className={`absolute inset-0 bg-gradient-to-b ${ambient}`} />

              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="size-80 rounded-full blur-3xl"
                  style={{ background: rarity.glow }}
                />
              </div>

              <div className="relative flex aspect-square items-center justify-center p-8">
                <Image
                  src={fruit.image}
                  alt={fruit.name}
                  width={418}
                  height={418}
                  className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                  priority
                />
              </div>

              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_0_rgba(0,0,0,0.6)]" />
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-6"
          >
            <div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${rarity.chip}`}>
                {rarity.label}
              </span>
            </div>

            <h1
              className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl"
              style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            >
              {fruit.name}
            </h1>

            <p className="text-lg leading-relaxed text-zinc-300">{fruit.blurb}</p>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <p className="text-5xl font-black text-white">S/{fruit.price.toFixed(2)}</p>
              <p className="text-lg text-zinc-500">${fruit.priceUSD.toFixed(2)} USD</p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${inStock ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.3)]' : 'bg-zinc-600'}`} />
              <span className={`text-sm font-semibold ${inStock ? 'text-green-400' : 'text-zinc-500'}`}>
                {inStock ? `${fruit.stock} en stock` : 'Agotado'}
              </span>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-red-500/30 via-red-500/10 to-transparent" />

            {/* Quantity selector */}
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-400">Cantidad</p>
              <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.1] bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  <Minus className="size-4" />
                </button>
                <span className="flex w-14 items-center justify-center text-lg font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(fruit.stock, quantity + 1))}
                  disabled={quantity >= fruit.stock}
                  className="flex size-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <p className="mt-1.5 text-xs text-zinc-600">Máximo: {fruit.stock} unidades</p>
            </div>

            {/* Subtotal */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-sm text-zinc-400">Subtotal</p>
              <p className="text-2xl font-black text-white">
                S/{(fruit.price * quantity).toFixed(2)}
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  (${(fruit.priceUSD * quantity).toFixed(2)} USD)
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`flex-1 rounded-xl border text-base font-bold transition-all ${
                  added
                    ? 'border-green-500/50 bg-green-600 text-white shadow-[0_0_20px_-8px_rgba(34,197,94,0.4)]'
                    : 'border-red-500/40 bg-red-600 text-white shadow-[0_0_25px_-10px_rgba(239,35,60,0.4)] hover:bg-red-500 hover:shadow-[0_0_35px_-12px_rgba(239,35,60,0.6)]'
                }`}
              >
                {added ? (
                  <><Check className="size-5" /> Agregado</>
                ) : (
                  <><ShoppingCart className="size-5" /> Agregar al carrito</>
                )}
              </Button>

              <Button
                size="lg"
                disabled={!inStock}
                onClick={handleBuyNow}
                className="btn-glow flex-1 rounded-xl border border-orange-500/30 bg-gradient-to-r from-orange-600 to-red-600 text-base font-bold text-white shadow-[0_0_25px_-10px_rgba(239,35,60,0.3)] transition-all hover:from-orange-500 hover:to-red-500 hover:shadow-[0_0_35px_-12px_rgba(239,35,60,0.5)]"
              >
                <Zap className="size-5" /> Comprar ahora
              </Button>
            </div>

            {/* Features */}
            <div className="mt-2 grid grid-cols-2 gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-red-400" />
                <span className="text-xs text-zinc-400">Envío rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-4 text-red-400" />
                <span className="text-xs text-zinc-400">Stock verificado</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-red-400" />
                <span className="text-xs text-zinc-400">Pago seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="size-4 text-red-400" />
                <span className="text-xs text-zinc-400">Soporte 24/7</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
