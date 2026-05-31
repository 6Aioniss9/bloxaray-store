'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Package, Save, Search, Star, ImageIcon } from 'lucide-react'

type AdminFruit = {
  id: string
  name: string
  image: string
  price: number
  priceUSD: number
  stock: number
  rarity: string
  blurb: string
  featured: boolean
}

const rarityOptions = ['Common', 'Rare', 'Legendary', 'Mythical']

export default function AdminFruitsPage() {
  const [fruits, setFruits] = useState<AdminFruit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [editFruit, setEditFruit] = useState<AdminFruit | null>(null)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/fruits')
      const data = await res.json()
      setFruits(Array.isArray(data) ? data : [])
    } catch {
      setFruits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleSave = async (fruit: AdminFruit, field: string, value: string | number | boolean) => {
    setSaving(fruit.id)
    try {
      await fetch('/api/admin/fruits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fruit.id, [field]: value }),
      })
      refresh()
    } catch {
      console.error('Error saving fruit')
    } finally {
      setSaving(null)
    }
  }

  const filtered = fruits.filter((f) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q) || f.rarity.toLowerCase().includes(q)
  })

  const rarityColor = (r: string) => {
    if (r === 'Mythical') return 'text-red-400 border-red-500/30 bg-red-500/10'
    if (r === 'Legendary') return 'text-orange-400 border-orange-500/30 bg-orange-500/10'
    if (r === 'Rare') return 'text-purple-400 border-purple-500/30 bg-purple-500/10'
    return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10'
  }

  return (
    <main className="min-h-screen bg-[#050510] pt-24">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex size-9 items-center justify-center rounded-lg border border-white/[0.06] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                Inventario de Frutas
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{fruits.length} frutas registradas</p>
            </div>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar frutas..."
              className="h-10 w-56 rounded-xl border border-white/[0.06] bg-black/40 pl-9 pr-3 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-red-500/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((fruit) => (
              <motion.div
                key={fruit.id}
                layout
                className="rounded-xl border border-white/[0.06] bg-[#0d0d12] overflow-hidden"
              >
                <div className="relative h-32 bg-black/40">
                  <div className={`absolute inset-0 bg-gradient-to-b ${
                    fruit.rarity === 'Mythical' ? 'from-red-950/40' :
                    fruit.rarity === 'Legendary' ? 'from-orange-950/30' :
                    fruit.rarity === 'Rare' ? 'from-purple-950/30' :
                    'from-zinc-950/20'
                  }`} />
                  <div className="relative flex h-full items-center justify-center">
                    <img
                      src={fruit.image}
                      alt={fruit.name}
                      className="h-24 w-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = ''
                        ;(e.target as HTMLImageElement).classList.add('hidden')
                        ;(e.target as HTMLImageElement).parentElement!.querySelector('.fallback')?.classList.remove('hidden')
                      }}
                    />
                    <ImageIcon className="fallback hidden size-8 text-zinc-600" />
                  </div>
                  <span className={`absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[8px] font-semibold uppercase ${rarityColor(fruit.rarity)}`}>
                    {fruit.rarity}
                  </span>
                  {fruit.featured && (
                    <Star className="absolute left-2 top-2 size-3.5 fill-yellow-500 text-yellow-500" />
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <h3 className="text-sm font-bold text-white">{fruit.name}</h3>
                  <p className="text-[10px] leading-relaxed text-zinc-500 line-clamp-2">{fruit.blurb}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Stock</label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSave(fruit, 'stock', Math.max(0, fruit.stock - 1))}
                          className="flex size-6 items-center justify-center rounded border border-white/[0.06] text-xs text-zinc-400 hover:bg-white/5"
                          disabled={saving === fruit.id}
                        >−</button>
                        <input
                          type="number"
                          value={fruit.stock}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0
                            handleSave(fruit, 'stock', Math.max(0, v))
                          }}
                          className="h-7 w-14 rounded border border-white/[0.06] bg-black/40 text-center text-xs text-white outline-none focus:border-red-500/30"
                          min={0}
                        />
                        <button
                          type="button"
                          onClick={() => handleSave(fruit, 'stock', fruit.stock + 1)}
                          className="flex size-6 items-center justify-center rounded border border-white/[0.06] text-xs text-zinc-400 hover:bg-white/5"
                          disabled={saving === fruit.id}
                        >+</button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Precio S/</label>
                      <input
                        type="number"
                        step="0.5"
                        value={fruit.price}
                        onChange={(e) => handleSave(fruit, 'price', parseFloat(e.target.value) || 0)}
                        className="h-7 w-20 rounded border border-white/[0.06] bg-black/40 px-2 text-right text-xs text-white outline-none focus:border-red-500/30"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">USD</label>
                      <input
                        type="number"
                        step="0.01"
                        value={fruit.priceUSD}
                        onChange={(e) => handleSave(fruit, 'priceUSD', parseFloat(e.target.value) || 0)}
                        className="h-7 w-20 rounded border border-white/[0.06] bg-black/40 px-2 text-right text-xs text-white outline-none focus:border-red-500/30"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Rareza</label>
                      <select
                        value={fruit.rarity}
                        onChange={(e) => handleSave(fruit, 'rarity', e.target.value)}
                        className="h-7 rounded border border-white/[0.06] bg-black/40 px-2 text-xs text-white outline-none focus:border-red-500/30"
                      >
                        {rarityOptions.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSave(fruit, 'featured', !fruit.featured)}
                      className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase transition-all ${
                        fruit.featured
                          ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                          : 'border-white/[0.06] text-zinc-500 hover:border-yellow-500/30 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="size-3" />
                      {fruit.featured ? 'Destacado' : 'Marcar destacado'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
