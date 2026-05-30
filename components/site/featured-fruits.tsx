'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { fruits } from '@/lib/fruits'
import { FruitCard } from '@/components/site/fruit-card'
import { Reveal } from '@/components/site/reveal'

const featured = fruits.filter((f) => f.featured).slice(0, 4)

export function FeaturedFruits() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/3 size-[300px] -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute right-0 bottom-1/4 size-[250px] translate-x-1/2 rounded-full bg-orange-500/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-red-400">
            Lo mas vendido
          </span>
          <h2
            className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            Frutas Destacadas
          </h2>
          <p className="mt-4 text-pretty text-base leading-relaxed text-zinc-400">
            Las frutas mas buscadas por nuestros clientes. Stock limitado y
            precios competitivos.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((fruit, i) => (
            <Reveal key={fruit.id} delay={i * 0.08} y={20}>
              <FruitCard fruit={fruit} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.4} className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            className="border-red-500/40 bg-black/30 text-white backdrop-blur transition-all duration-300 hover:bg-red-600/20 hover:text-white"
          >
            <Link href="/stock">
              Ver catalogo completo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
