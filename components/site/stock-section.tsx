'use client'

import { useMemo, useState } from 'react'
import { Search, PackageSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { fruits, type Rarity } from '@/lib/fruits'
import { FruitCard } from '@/components/site/fruit-card'
import { Reveal, SectionHeading } from '@/components/site/reveal'
import { cn } from '@/lib/utils'

const filters: ('All' | Rarity)[] = [
  'All',
  'Common',
  'Rare',
  'Legendary',
  'Mythical',
]

export function StockSection() {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<'All' | Rarity>('All')

  const results = useMemo(() => {
    return fruits.filter((f) => {
      const matchesQuery = f.name
        .toLowerCase()
        .includes(query.trim().toLowerCase())
      const matchesRarity = active === 'All' || f.rarity === active
      return matchesQuery && matchesRarity
    })
  }, [query, active])

  return (
    <section id="stock" className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-1/3 -z-10 size-[420px] rounded-full glow-orange blur-3xl opacity-40" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live Stock"
          title="Complete stock"
          description="Search and filter every available fruit in real time. What you see is what's ready to deliver."
        />

        <Reveal className="mx-auto mb-10 flex max-w-3xl flex-col gap-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fruits…"
              className="h-12 rounded-xl border-border bg-card/60 pl-11 text-base backdrop-blur placeholder:text-muted-foreground focus-visible:ring-primary"
              aria-label="Search fruits"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  active === f
                    ? 'border-primary/50 bg-primary/15 text-primary shadow-[0_0_20px_-8px_var(--primary)]'
                    : 'border-border bg-card/40 text-muted-foreground hover:text-foreground',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </Reveal>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((fruit, i) => (
              <Reveal key={fruit.id} delay={Math.min(i * 0.05, 0.3)}>
                <FruitCard fruit={fruit} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center">
            <PackageSearch className="size-8 text-muted-foreground" />
            <p className="font-medium">No fruits match your search</p>
            <p className="text-sm text-muted-foreground">
              Try a different name or filter.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
