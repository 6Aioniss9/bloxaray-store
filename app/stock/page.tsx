'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, PackageSearch, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { type Fruit, type Rarity } from '@/lib/fruits'
import { FruitCard } from '@/components/site/fruit-card'

const filters: ('Todas' | Rarity)[] = ['Todas', 'Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical']

export default function StockPage() {
  const [fruits, setFruits] = useState<Fruit[]>([])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<'Todas' | Rarity>('Todas')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/fruits')
      .then((r) => r.json())
      .then((data) => setFruits(Array.isArray(data) ? data as Fruit[] : []))
      .catch(() => setFruits([]))
      .finally(() => setLoading(false))
  }, [])

  const results = useMemo(() => {
    return fruits.filter((f) => {
      const matchesQuery = f.name.toLowerCase().includes(query.trim().toLowerCase())
      const matchesRarity = active === 'Todas' || f.rarity === active
      return matchesQuery && matchesRarity
    })
  }, [fruits, query, active])

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/backgrounds/pueblo.png')", backgroundAttachment: 'fixed' }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-red-950/10" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#050510] via-[#050510]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050510] via-[#050510]/80 to-transparent" />
      </div>

      <section className="relative overflow-hidden pb-6 sm:pb-10">
        <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="size-[500px] rounded-full bg-black/40 blur-[100px] sm:size-[700px]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2">
            <div className="size-[600px] rounded-full blur-3xl sm:size-[700px]" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.08) 0%, transparent 70%)' }} />
          </div>

          <motion.div className="mx-auto w-full max-w-6xl text-center" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <motion.span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-400 shadow-[0_0_20px_-8px_rgba(239,35,60,0.3)] backdrop-blur-sm" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,35,60,0.5)]" />
              Stock en Vivo
            </motion.span>

            <motion.h1 className="mt-4 flex flex-wrap items-center justify-center gap-x-4 font-black uppercase leading-[1.15] md:flex-nowrap" style={{ fontFamily: 'var(--font-heading), sans-serif', textShadow: '0 4px 48px rgba(0,0,0,0.6), 0 0 60px rgba(239,35,60,0.08)', fontSize: 'clamp(1.5rem, 5vw, 3.8rem)', letterSpacing: '0.03em' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <span className="md:whitespace-nowrap"><span className="text-white">FRUTAS DISPONIBLES</span></span>
              <span className="md:whitespace-nowrap"><span className="text-white">EN </span><span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">STOCK</span></span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
              <p className="mx-auto mt-4 text-[15px] leading-relaxed text-zinc-300 sm:whitespace-nowrap sm:text-base">Elige tu fruta, revisa el stock actualizado y compra directo por Discord.</p>
            </motion.div>
          </motion.div>

          <motion.div className="mt-5 flex items-center justify-center" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ originX: 0.5 }}>
            <div className="flex w-2/5 items-center gap-3 sm:gap-4">
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-red-400/50 to-red-500/30" />
              <div className="size-2 rotate-45 bg-red-400 shadow-[0_0_12px_rgba(239,35,60,0.6)] sm:size-2.5" />
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-red-500/30 via-red-400/50 to-transparent" />
            </div>
          </motion.div>

          <motion.div className="mx-auto mt-8 max-w-2xl sm:mt-10" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}>
            <div className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-xl sm:rounded-3xl sm:p-6 sm:border-red-500/5 sm:shadow-[0_0_40px_-16px_rgba(239,35,60,0.12)]">
              <div className="p-4 sm:p-0">
                <div className="relative group">
                  <div className="relative flex items-center rounded-xl border border-white/[0.07] bg-black/60 backdrop-blur-sm transition-all duration-300 focus-within:border-red-500/40 focus-within:shadow-[0_0_30px_-10px_rgba(239,35,60,0.3)] sm:rounded-2xl">
                    <Search className="pointer-events-none absolute left-4 size-4 text-zinc-500 transition-colors duration-300 group-focus-within:text-red-400" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder="Busca tu fruta..." className="h-13 border-0 bg-transparent pl-12 pr-4 text-[15px] text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none sm:h-14 sm:pl-13 sm:text-base" aria-label="Buscar frutas" />
                    {query && (
                      <button onClick={() => setQuery('')} className="mr-2 flex size-6 items-center justify-center rounded-full bg-white/10 text-xs text-zinc-400 transition-colors hover:bg-white/20 hover:text-white">✕</button>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-center gap-3 pb-1">
                  {filters.map((f, i) => (
                    <motion.button key={f} type="button" onClick={() => setActive(f)} className="relative rounded-full px-6 py-2.5 text-sm font-semibold uppercase tracking-wider transition-all" whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 + i * 0.1 }}>
                      {active === f ? (
                        <motion.div layoutId="filter-bg" className="absolute inset-0 rounded-full border border-red-500/40 bg-red-500/15 shadow-[0_0_20px_-8px_rgba(239,35,60,0.3)]" transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                      ) : (
                        <div className="absolute inset-0 rounded-full border border-white/[0.07] bg-black/40 transition-colors duration-300 hover:border-red-500/20 hover:bg-red-500/5" />
                      )}
                      <span className={`relative z-10 flex items-center gap-1.5 ${active === f ? 'text-red-400' : 'text-zinc-400'}`}>
                        {f === 'Mythical' && <Sparkles className="size-3.5" />}{f}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="size-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          </div>
        ) : results.length > 0 ? (
          <>
            <motion.p className="mb-5 text-sm text-zinc-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={`count-${results.length}`}>
              {results.length} {results.length === 1 ? 'fruta encontrada' : 'frutas encontradas'}
            </motion.p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((fruit, i) => (
                <FruitCard fruit={fruit} index={i} key={fruit.id} />
              ))}
            </div>
          </>
        ) : (
          <motion.div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <PackageSearch className="size-8 text-zinc-500" />
            <p className="font-medium text-white">No hay frutas que coincidan con tu busqueda</p>
            <p className="text-sm text-zinc-500">Prueba con otro nombre o filtro.</p>
          </motion.div>
        )}
      </div>
    </main>
  )
}
