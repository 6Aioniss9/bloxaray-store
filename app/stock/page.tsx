'use client'

import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, PackageSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { type Fruit, type Rarity } from '@/lib/fruits'
import { FruitCard } from '@/components/site/fruit-card'

type Filter = 'Todas' | Rarity
const filters: Filter[] = ['Todas', 'Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical']

const FILTER_COLORS: Record<Filter, { activeBorder: string; activeBg: string; activeText: string; activeShadow: string; defaultBorder: string; defaultHoverBorder: string }> = {
  Todas:      { activeBorder: 'border-zinc-400/50', activeBg: 'bg-zinc-500/15', activeText: 'text-zinc-300', activeShadow: 'rgba(161,161,170,0.25)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-zinc-500/30' },
  Common:     { activeBorder: 'border-zinc-500/50', activeBg: 'bg-zinc-500/15', activeText: 'text-zinc-300', activeShadow: 'rgba(113,113,122,0.3)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-zinc-500/30' },
  Uncommon:   { activeBorder: 'border-cyan-500/50', activeBg: 'bg-cyan-500/15', activeText: 'text-cyan-300', activeShadow: 'rgba(6,182,212,0.3)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-cyan-500/30' },
  Rare:       { activeBorder: 'border-purple-500/50', activeBg: 'bg-purple-500/15', activeText: 'text-purple-300', activeShadow: 'rgba(168,85,247,0.3)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-purple-500/30' },
  Legendary:  { activeBorder: 'border-fuchsia-500/50', activeBg: 'bg-fuchsia-500/15', activeText: 'text-fuchsia-300', activeShadow: 'rgba(217,70,239,0.3)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-fuchsia-500/30' },
  Mythical:   { activeBorder: 'border-red-500/50', activeBg: 'bg-red-500/15', activeText: 'text-red-300', activeShadow: 'rgba(239,35,60,0.35)', defaultBorder: 'border-white/[0.07]', defaultHoverBorder: 'border-red-500/30' },
}

export default function StockPage() {
  const [fruits, setFruits] = useState<Fruit[]>([])
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Filter>('Todas')
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
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/15 via-transparent to-red-950/10" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#050510] via-[#050510]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050510] via-[#050510]/80 to-transparent" />
      </div>

      <section className="relative pb-10 sm:pb-14">
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="size-[400px] rounded-full bg-black/30 blur-[80px] sm:size-[500px]" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2">
            <div className="size-[500px] rounded-full blur-3xl sm:size-[600px]" style={{ background: 'radial-gradient(circle, rgba(239,35,60,0.06) 0%, transparent 70%)' }} />
          </div>

          <motion.div className="text-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <motion.span className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/8 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-red-400 shadow-[0_0_16px_-8px_rgba(239,35,60,0.25)] backdrop-blur-sm" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
              <span className="size-1.5 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,35,60,0.4)]" />
              Stock en Vivo
            </motion.span>

            <motion.h1 className="mt-3 flex flex-wrap items-center justify-center gap-x-3 font-black uppercase leading-[1.1] md:flex-nowrap" style={{ fontFamily: 'var(--font-heading), sans-serif', textShadow: '0 4px 40px rgba(0,0,0,0.5)', fontSize: 'clamp(1.4rem, 5vw, 3.4rem)', letterSpacing: '0.03em' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
              <span className="text-white">FRUTAS DISPONIBLES</span>
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-orange-400 bg-clip-text text-transparent">EN STOCK</span>
            </motion.h1>

            <motion.p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-400 sm:text-base" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              Elige tu fruta, revisa el stock actualizado y compra directo por Discord.
            </motion.p>
          </motion.div>

          <motion.div className="mx-auto mt-6 max-w-2xl sm:mt-8" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <div className="rounded-2xl border border-white/[0.06] bg-black/40 backdrop-blur-xl sm:rounded-2xl sm:border-white/[0.05] sm:shadow-[0_0_40px_-20px_rgba(0,0,0,0.5)]">
              <div className="px-4 py-4 sm:px-6 sm:py-5">
                <div className="relative">
                  <div className="relative flex items-center rounded-xl border border-white/[0.06] bg-black/50 backdrop-blur-sm transition-all duration-300 focus-within:border-red-500/30 focus-within:shadow-[0_0_24px_-10px_rgba(239,35,60,0.2)]">
                    <Search className="pointer-events-none absolute left-3.5 size-4 text-zinc-500 transition-colors duration-300 peer-focus-within:text-red-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Busca tu fruta..."
                      className="peer h-11 border-0 bg-transparent pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:outline-none sm:h-12 sm:pl-11 sm:text-[15px]"
                      aria-label="Buscar frutas"
                    />
                    {query && (
                      <button onClick={() => setQuery('')} className="mr-1.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white/8 text-[11px] text-zinc-500 transition-colors hover:bg-white/15 hover:text-zinc-300">✕</button>
                    )}
                  </div>
                </div>

                <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 sm:mt-4 sm:gap-2.5">
                  {filters.map((f, i) => {
                    const c = FILTER_COLORS[f]
                    const isActive = active === f
                    return (
                      <motion.button
                        key={f}
                        type="button"
                        onClick={() => setActive(f)}
                        className="relative h-9 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 sm:h-10 sm:px-5 sm:text-xs"
                        whileTap={{ scale: 0.96 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.35 + i * 0.06 }}
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="filter-bg"
                            className={`absolute inset-0 rounded-full border ${c.activeBorder} ${c.activeBg}`}
                            style={{ boxShadow: `0 0 18px -6px ${c.activeShadow}` }}
                            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          />
                        ) : (
                          <div className={`absolute inset-0 rounded-full border ${c.defaultBorder} bg-black/30 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04]`} />
                        )}
                        <span className={`relative z-10 ${isActive ? c.activeText : 'text-zinc-400'}`}>{f}</span>
                      </motion.button>
                    )
                  })}
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
